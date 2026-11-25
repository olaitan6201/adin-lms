import { InfrastructureReadings } from './InfrastructureReadings';
import { Form } from '@inertiajs/react';
import { OperationsInput, OperationsSelect, CorrectionFocus } from './OperationsFields';

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
    const { settings } = data;
    const button = 'justify-self-start rounded border px-3 py-2';
    return (
        <section className="space-y-5" aria-label="Infrastructure">
            <InfrastructureReadings data={data} />
            <Form id="monitor-settings" className="portal-panel desk-shelf"
                action="/operations/infrastructure" method="post">
                {({ errors, processing, recentlySuccessful }) => (
                    <fieldset className="grid gap-3">
                        <legend className="font-semibold">Monitoring and attendance integration</legend>
                        <CorrectionFocus errors={errors} />
                        <OperationsInput label="Storage warning (MiB)" error={errors.storage_mib}
                            name="storage_mib"
                            type="number"
                            min="1"
                            max="100000000"
                            defaultValue={settings.storage_mib}
                            required
                        />
                        <OperationsInput label="Database warning (ms)" error={errors.probe_ms}
                            name="probe_ms"
                            type="number"
                            min="1"
                            max="60000"
                            defaultValue={settings.probe_ms}
                            required
                        />
                        <OperationsSelect label="Attendance bridge key slot" error={errors.bridge_slot} name="bridge_slot" defaultValue={settings.bridge_slot}>
                            <option value="primary">Primary host key</option>
                            <option value="standby">Standby host key</option>
                            <option value="disabled">Disabled</option>
                        </OperationsSelect>
                        <p>
                            Changing slots takes effect on the next check-in. Provision the matching key on the host and
                            at the provider first.
                        </p>
                        <button className={button} disabled={processing}>
                            Save infrastructure settings
                        </button>
                        {recentlySuccessful && <p role="status">Infrastructure settings saved.</p>}
                    </fieldset>
                )}
            </Form>
            <h2 className="text-xl font-semibold">Backup and restore evidence</h2>
            <div aria-label="Backup runner outcome">
                <h3 className="font-semibold">Latest backup job</h3>
                <p>{data.backup.state === 'snapshot' ? 'Encrypted snapshot checksums verified' :
                    data.backup.state === 'failed' ? 'Backup failed — investigate the host alert' :
                    data.backup.state === 'not_configured' ? 'Host monitoring is not configured' : 'Host report unavailable or invalid'}</p>
                {data.backup.finished_at && <p>{data.backup.run} · {new Date(data.backup.finished_at).toLocaleString()} · {
                    data.backup.overdue === null ? 'No freshness target configured' : data.backup.overdue ? 'Report overdue' : 'Within reporting interval'
                }</p>}
            </div>
            <Form id="backup-receipt" className="portal-panel desk-shelf"
                action="/operations/backup-evidence" method="post">
                {({ errors, processing, recentlySuccessful }) => (
                    <fieldset className="grid gap-3">
                        <legend className="font-semibold">New backup receipt</legend>
                        <CorrectionFocus errors={errors} />
                        <p>Log the inspected ticket and outcome. Recording a receipt does not start a backup or restore.</p>
                        <OperationsInput label="Evidence reference" error={errors.reference} name="reference" required pattern="[A-Za-z0-9_\-]{1,64}" />
                        <OperationsSelect label="Observed outcome" error={errors.outcome} name="outcome">
                                <option value="snapshot">Snapshot completed</option>
                                <option value="restored">Isolated restore checked</option>
                                <option value="failed">Backup or restore failed</option>
                        </OperationsSelect>
                        <button className={button} disabled={processing}>
                            Record backup evidence
                        </button>
                        {recentlySuccessful && <p role="status">Backup receipt recorded.</p>}
                    </fieldset>
                )}
            </Form>
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
        </section>
    );
}
