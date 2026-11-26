import { InfrastructureReadings } from './InfrastructureReadings';
import { RegistryPanel } from '@/components/academics/RegistryPanel';
import { MonitoringSettings } from '@/components/operations/infrastructure/MonitoringSettings';
import { BackupReceiptForm } from '@/components/operations/infrastructure/BackupReceiptForm';

export type Infrastructure = {
    backup: { state: string; run?: string; finished_at?: string; overdue?: boolean | null };
    settings: {
        storage_mib: number;
        probe_ms: number;
        bridge_slot: string;
    };
    measured: string;
    bytes: number;
    probe: number;
    jobs: number | null;
    failed: number | null;
    queue: string;
    receipts: {
        id: string;
        reference: string;
        outcome: string;
        time: string;
    }[];
};

export default function InfrastructurePanel({ data }: { data: Infrastructure }) {
    return (
        <section className="space-y-5" aria-label="Infrastructure">
            <div className="grid items-start gap-5 xl:grid-cols-[3fr_2fr]">
                <InfrastructureReadings data={data} />
                <MonitoringSettings settings={data.settings} />
            </div>
            <RegistryPanel title="Backup and restore evidence">
                <div aria-label="Backup runner outcome">
                    <h3 className="font-semibold">Latest backup job</h3>
                    <p>
                        {data.backup.state === 'snapshot'
                            ? 'Encrypted snapshot checksums verified'
                            : data.backup.state === 'failed'
                              ? 'Backup failed — investigate the host alert'
                              : data.backup.state === 'not_configured'
                                ? 'Host monitoring is not configured'
                                : 'Host report unavailable or invalid'}
                    </p>
                    {data.backup.finished_at && (
                        <p>
                            {data.backup.run} · {new Date(data.backup.finished_at).toLocaleString()} ·{' '}
                            {data.backup.overdue === null
                                ? 'No freshness target configured'
                                : data.backup.overdue
                                  ? 'Report overdue'
                                  : 'Within reporting interval'}
                        </p>
                    )}
                </div>
                <BackupReceiptForm />
                {data.receipts.length === 0 ? (
                    <p>No backup evidence recorded.</p>
                ) : (
                    <ol aria-label="Latest ten backup receipts">
                        {data.receipts.map((row) => (
                            <li className="break-words" key={row.id}>
                                {new Date(row.time).toLocaleString()} · {row.outcome} · {row.reference}
                            </li>
                        ))}
                    </ol>
                )}
            </RegistryPanel>
        </section>
    );
}
