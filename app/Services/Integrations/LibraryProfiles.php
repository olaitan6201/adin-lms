<?php

namespace App\Services\Integrations;

use App\Enums\PermissionCode;
use App\Enums\RoleCode;
use App\Enums\ScopeType;
use App\Models\Offering;
use App\Models\RoleGrant;
use App\Models\User;
use App\Policies\LearningPolicy;

final class LibraryProfiles
{
    public function __construct(private LearningPolicy $learning) {}

    public function forUser(User $user, Offering $offering, bool $tools = false): array
    {
        $learner = $this->learning->published($offering) && $this->learning->enrolment($user->id, $offering);
        $instructor = $this->learning->allocated($user->id, $offering) && RoleGrant::where('user_id', $user->id)
            ->whereHas('role', fn ($q) => $q->where('roles.code', RoleCode::Lecturer)
                ->join('role_permissions', 'role_permissions.role_id', '=', 'roles.id')
                ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
                ->where('permissions.code', PermissionCode::RosterRead))
            ->whereHas('accessScope', fn ($q) => $q->where('scope_key', ScopeType::Offering->key($offering->id)))
            ->exists();
        abort_unless($learner || $instructor, 404);

        $available = [];
        foreach (config($tools ? 'integrations.tools' : 'integrations.libraries') as $key => $entry) {
            if (! is_string($key) || ! preg_match('/^[a-z][a-z0-9-]{0,62}$/D', $key)
                || ! is_string($entry['label'] ?? null) || trim($entry['label']) === ''
                || ! is_array($entry['offerings'] ?? null) || ! is_array($entry['roles'] ?? null)
                || ! in_array($offering->external_offering_id, $entry['offerings'], true)
                || ! (($learner && in_array('learner', $entry['roles'], true))
                    || ($instructor && in_array('instructor', $entry['roles'], true)))
                || ! self::publicLink($entry['url'] ?? null)) {
                continue;
            }
            if ($tools && (! self::publicLink($entry['login'] ?? null) || ! self::publicLink($entry['redirect'] ?? null)
                || ! is_string($entry['client'] ?? null) || $entry['client'] === ''
                || ! is_string($entry['deployment'] ?? null) || $entry['deployment'] === '')) {
                continue;
            }
            $available[$key] = $entry;
            $available[$key]['membership'] = $instructor && in_array('instructor', $entry['roles'], true) ? 'Instructor' : 'Learner';
        }

        return $available;
    }

    public static function publicLink(mixed $url): bool
    {
        return is_string($url) && filter_var($url, FILTER_VALIDATE_URL)
            && ! preg_match('/[\\\\\s]/', $url) && parse_url($url, PHP_URL_SCHEME) === 'https'
            && parse_url($url, PHP_URL_USER) === null && parse_url($url, PHP_URL_PASS) === null;
    }
}
