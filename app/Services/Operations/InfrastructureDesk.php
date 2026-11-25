<?php

namespace App\Services\Operations;

use App\Enums\BridgeSlot;
use App\Enums\OperationsEvent;
use App\Models\AuditLog;
use App\Models\File;
use App\Models\SystemConfiguration;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class InfrastructureDesk
{
    private const KEY = 'operations.monitoring';

    /** @return array{storage_mib:int,probe_ms:int,bridge_slot:string} */
    public function settings(): array
    {
        return SystemConfiguration::where('key', self::KEY)->first()?->value
            ?? ['storage_mib' => 1024, 'probe_ms' => 250, 'bridge_slot' => BridgeSlot::Primary->value];
    }

    /** @param array{storage_mib:int,probe_ms:int,bridge_slot:string} $settings */
    public function configure(User $operator, array $settings): void
    {
        $slot = BridgeSlot::from($settings['bridge_slot']);
        if ($slot !== BridgeSlot::Disabled && strlen($slot->key() ?? '') < 32 && $this->settings()['bridge_slot'] !== $slot->value) {
            throw ValidationException::withMessages(['bridge_slot' => 'Provision this slot on the host first, or disable the bridge.']);
        }

        DB::transaction(function () use ($operator, $settings): void {
            SystemConfiguration::unguarded(fn () => SystemConfiguration::updateOrCreate(['key' => self::KEY], [
                'value' => $settings, 'updated_by' => $operator->id,
            ]));
            OperationsAudit::record($operator, OperationsEvent::InfrastructureChanged, self::KEY, $settings);
        });
    }

    /** @return array<string,mixed> */
    public function snapshot(): array
    {
        $start = hrtime(true);
        DB::selectOne('select 1');
        $probe = round((hrtime(true) - $start) / 1e6, 2);
        $connection = config('queue.connections.'.config('queue.default'));
        $failed = config('queue.failed');

        return [
            'settings' => $this->settings(),
            'measured' => now()->toIso8601String(),
            'bytes' => (int) File::sum('size_bytes'),
            'probe' => $probe,
            'queue' => $connection['driver'] ?? 'unknown',
            'jobs' => ($connection['driver'] ?? '') === 'database'
                ? DB::connection($connection['connection'])->table($connection['table'])->count() : null,
            'failed' => in_array($failed['driver'], ['database', 'database-uuids'], true)
                ? DB::connection($failed['database'])->table($failed['table'])->count() : null,
            'receipts' => AuditLog::where('action', OperationsEvent::BackupEvidence->value)
                ->orderByDesc('occurred_at')->orderByDesc('id')->limit(10)->get()
                ->map(fn (AuditLog $row): array => [
                    'id' => $row->id, 'reference' => $row->subject_key, 'outcome' => $row->details['outcome'],
                    'time' => $row->occurred_at->toIso8601String(),
                ]),
        ];
    }
}
