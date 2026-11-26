import { NativeSelectOption } from '@/components/ui/native-select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InfrastructureReadings } from './InfrastructureReadings';
import { Form } from '@inertiajs/react';
import { RegistryPanel } from '@/components/academics/RegistryPanel';
import { OperationsInput, OperationsSelect, CorrectionFocus } from '../OperationsFields';

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

    return (
        <section className="space-y-5" aria-label="Infrastructure">
            <div className="grid items-start gap-5 xl:grid-cols-[3fr_2fr]">
            <InfrastructureReadings data={data} />
            <Card><CardContent><Form id="monitor-settings" className="min-w-0"
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
                            <NativeSelectOption value="primary">Primary host key</NativeSelectOption>
                            <NativeSelectOption value="standby">Standby host key</NativeSelectOption>
                            <NativeSelectOption value="disabled">Disabled</NativeSelectOption>
                        </OperationsSelect>
                        <p>
                            Changing slots takes effect on the next check-in. Provision the matching key on the host and
                            at the provider first.
                        </p>
                        <Button variant="outline" disabled={processing}>
                            Save infrastructure settings
                        </Button>
                        {recentlySuccessful && <p role="status">Infrastructure settings saved.</p>}
                    </fieldset>
                )}
            </Form></CardContent></Card>
            </div>
            <RegistryPanel title="Backup and restore evidence">
            <div aria-label="Backup runner outcome">
                <h3 className="font-semibold">Latest backup job</h3>
                <p>{data.backup.state === 'snapshot' ? 'Encrypted snapshot checksums verified' :
                    data.backup.state === 'failed' ? 'Backup failed — investigate the host alert' :
                    data.backup.state === 'not_configured' ? 'Host monitoring is not configured' : 'Host report unavailable or invalid'}</p>
                {data.backup.finished_at && <p>{data.backup.run} · {new Date(data.backup.finished_at).toLocaleString()} · {
                    data.backup.overdue === null ? 'No freshness target configured' : data.backup.overdue ? 'Report overdue' : 'Within reporting interval'
                }</p>}
            </div>
            <Card><CardContent><Form id="backup-receipt" className="min-w-0"
                action="/operations/backup-evidence" method="post">
                {({ errors, processing, recentlySuccessful }) => (
                    <fieldset className="grid gap-3">
                        <legend className="font-semibold">New backup receipt</legend>
                        <CorrectionFocus errors={errors} />
                        <p>Log the inspected ticket and outcome. Recording a receipt does not start a backup or restore.</p>
                        <OperationsInput label="Evidence reference" error={errors.reference} name="reference" required pattern="[A-Za-z0-9_\-]{1,64}" />
                        <OperationsSelect label="Observed outcome" error={errors.outcome} name="outcome">
                                <NativeSelectOption value="snapshot">Snapshot completed</NativeSelectOption>
                                <NativeSelectOption value="restored">Isolated restore checked</NativeSelectOption>
                                <NativeSelectOption value="failed">Backup or restore failed</NativeSelectOption>
                        </OperationsSelect>
                        <Button variant="outline" disabled={processing}>
                            Record backup evidence
                        </Button>
                        {recentlySuccessful && <p role="status">Backup receipt recorded.</p>}
                    </fieldset>
                )}
            </Form></CardContent></Card>
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
