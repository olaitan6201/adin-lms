import { Form, Link } from '@inertiajs/react';

export type Infrastructure = {
    settings: { storage_mib: number; probe_ms: number; bridge_slot: string };
    measured: string;
    bytes: number;
    probe: number;
    jobs: number | null;
    failed: number | null;
    queue: string;
    receipts: { id: string; reference: string; outcome: string; time: string }[];
};

export default function InfrastructurePanel({ data }: { data: Infrastructure }) {
    const { settings } = data;
    const field = 'block max-w-full rounded border p-2';
    const button = 'rounded bg-teal-900 px-3 py-2 text-white';
    return (
        <section className="space-y-5" aria-label="Infrastructure">
            <h2 className="text-xl font-semibold">Storage and performance</h2>
            <p>Sampled {new Date(data.measured).toLocaleString()}. <Link href="/operations" className="underline">Refresh readings</Link></p>
            <dl className="grid gap-3 sm:grid-cols-2">
                <div><dt>Registered file bytes</dt><dd>{data.bytes.toLocaleString()} · {data.bytes >= settings.storage_mib * 1048576 ? 'At or above warning level' : 'Below warning level'}</dd></div>
                <div><dt>Database round trip</dt><dd>{data.probe} ms · {data.probe >= settings.probe_ms ? 'At or above warning level' : 'Below warning level'}</dd></div>
                <div><dt>Database queue rows (including reserved)</dt><dd>{data.jobs ?? `Not measured (${data.queue} driver)`}</dd></div>
                <div><dt>Retained failed jobs</dt><dd>{data.failed ?? 'Failure store not measured'}</dd></div>
            </dl>
            <p>File metadata excludes unregistered objects. A single database probe does not measure page speed.</p>
            <Form action="/operations/infrastructure" method="post">
                {({ errors, processing, recentlySuccessful }) => <fieldset className="grid gap-3">
                    <legend className="font-semibold">Monitoring and attendance integration</legend>
                    <label>Storage warning (MiB)<input className={field} name="storage_mib" type="number" min="1" max="100000000" defaultValue={settings.storage_mib} required /></label>
                    <label>Database warning (ms)<input className={field} name="probe_ms" type="number" min="1" max="60000" defaultValue={settings.probe_ms} required /></label>
                    <label>Attendance bridge key slot<select className={field} name="bridge_slot" defaultValue={settings.bridge_slot}>
                        <option value="primary">Primary host key</option><option value="standby">Standby host key</option><option value="disabled">Disabled</option>
                    </select></label>
                    <p>Changing slots takes effect on the next check-in. Provision the matching key on the host and at the provider first.</p>
                    {Object.values(errors).map(error => <p key={error} role="alert">{error}</p>)}
                    <button className={button} disabled={processing}>Save infrastructure settings</button>
                    {recentlySuccessful && <p role="status">Infrastructure settings saved.</p>}
                </fieldset>}
            </Form>
            <h2 className="text-xl font-semibold">Backup and restore evidence</h2>
            <p>Record the external job or rehearsal ticket after inspecting it. These receipts are operator reports.</p>
            <Form action="/operations/backup-evidence" method="post">
                {({ errors, processing, recentlySuccessful }) => <fieldset className="grid gap-3">
                    <legend className="font-semibold">New backup receipt</legend>
                    <label>Evidence reference<input className={field} name="reference" required pattern="[A-Za-z0-9_\-]{1,64}" /></label>
                    <label>Observed outcome<select className={field} name="outcome"><option value="snapshot">Snapshot completed</option><option value="restored">Isolated restore checked</option><option value="failed">Backup or restore failed</option></select></label>
                    {Object.values(errors).map(error => <p key={error} role="alert">{error}</p>)}
                    <button className={button} disabled={processing}>Record backup evidence</button>
                    {recentlySuccessful && <p role="status">Backup receipt recorded.</p>}
                </fieldset>}
            </Form>
            {data.receipts.length === 0 ? <p>No backup evidence recorded.</p> :
                <ol aria-label="Latest ten backup receipts">{data.receipts.map(row => <li className="break-words" key={row.id}>{new Date(row.time).toLocaleString()} · {row.outcome} · {row.reference}</li>)}</ol>}
        </section>
    );
}
