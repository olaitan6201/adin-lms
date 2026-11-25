<?php

namespace App\Services\ScormRuntime;

use App\Enums\EnrolmentStatus;
use App\Models\Enrolment;
use App\Models\Offering;
use App\Policies\LearningPolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class ReadingAttempts
{
    public function __construct(private LearningPolicy $policy) {}

    public function open(Request $request, Offering $offering, string $package): array
    {
        $grant = bin2hex(random_bytes(32));
        $lease = ['grant_hash' => $this->digest($request, $grant), 'expires_at' => now()->addMinutes(30)];

        return DB::transaction(function () use ($request, $offering, $grant, $lease, $package): array {
            $scope = $this->scope($request, $offering, $package);
            DB::table('scorm_progress')->upsert($scope + $lease + [
                'id' => (string) Str::uuid7(), 'state' => json_encode(ReadingState::INITIAL, JSON_THROW_ON_ERROR),
            ], array_keys($scope), array_keys($lease));
            $state = json_decode(DB::table('scorm_progress')->where($scope)->value('state'), true, flags: JSON_THROW_ON_ERROR);
            $reading = DB::table('scorm_packages')->where('id', $package)->first(['lesson', 'title']);

            if ($state['cmi.core.lesson_status'] === 'completed') {
                DB::table('scorm_progress')->where($scope)->update(['grant_hash' => null]);
            }

            return ['grant' => $grant, 'state' => $state, 'lesson' => $reading->lesson, 'title' => $reading->title];
        });
    }

    public function save(Request $request, Offering $offering, string $package): void
    {
        $grant = (string) $request->header('X-Reading-Grant');
        $body = $request->getContent();
        abort_unless($request->isJson() && strlen($body) <= 32768, 422);
        abort_unless(preg_match('/^[a-f0-9]{64}$/D', $grant)
            && hash_equals(hash_hmac('sha256', $body, $grant), (string) $request->header('X-Reading-Signature')), 403);
        $state = ReadingState::validate(json_decode($body, true, 4));
        DB::transaction(function () use ($request, $offering, $package, $grant, $state): void {
            $scope = $this->scope($request, $offering, $package);
            $updated = DB::table('scorm_progress')->where($scope)
                ->where('grant_hash', $this->digest($request, $grant))->where('expires_at', '>', now())
                ->update(['grant_hash' => null, 'state' => json_encode($state, JSON_THROW_ON_ERROR)]);
            abort_unless($updated === 1, 409);
        });
    }

    private function scope(Request $request, Offering $offering, string $package): array
    {
        $current = Offering::whereKey($offering->id)->sharedLock()->firstOrFail();
        $enrolment = Enrolment::where('offering_id', $current->id)->where('status', EnrolmentStatus::Registered)
            ->whereHas('student', fn ($q) => $q->where('user_id', $request->user()->id))->sharedLock()->first();
        abort_unless($enrolment && $this->policy->published($current)
            && DB::table('scorm_packages')->where(['id' => $package, 'offering_id' => $offering->id])->exists(), 404);

        return ['package_id' => $package, 'enrolment_id' => $enrolment->id];
    }

    private function digest(Request $request, string $grant): string
    {
        return hash_hmac('sha256', $request->session()->getId().':'.$request->user()->id, $grant);
    }
}
