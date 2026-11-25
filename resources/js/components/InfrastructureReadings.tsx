import { Link } from '@inertiajs/react';
import type { Infrastructure } from './InfrastructurePanel';

export function InfrastructureReadings({ data }: { data: Infrastructure }) {
    const { settings } = data;

    return (<>
<h2 className="text-xl font-semibold">Storage and performance</h2>
<p>
    Sampled {new Date(data.measured).toLocaleString()}.{' '}
    <Link href="/operations" className="underline">
        Refresh readings
    </Link>
</p>
<dl className="grid gap-3 sm:grid-cols-2">
    <div>
        <dt>Registered file bytes</dt>
        <dd>
            {data.bytes.toLocaleString()} ·{' '}
            {data.bytes >= settings.storage_mib * 1048576
                ? 'At or above warning level'
                : 'Below warning level'}
        </dd>
    </div>
    <div>
        <dt>Database round trip</dt>
        <dd>
            {data.probe} ms ·{' '}
            {data.probe >= settings.probe_ms ? 'At or above warning level' : 'Below warning level'}
        </dd>
    </div>
    <div>
        <dt>Database queue rows (including reserved)</dt>
        <dd>{data.jobs ?? `Not measured (${data.queue} driver)`}</dd>
    </div>
    <div>
        <dt>Retained failed jobs</dt>
        <dd>{data.failed ?? 'Failure store not measured'}</dd>
    </div>
</dl>
<p>File metadata excludes unregistered objects. A single database probe does not measure page speed.</p>
</>);
}
