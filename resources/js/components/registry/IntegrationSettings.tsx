import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { type Desk, Field } from './Desk';
import { cap, Records, status, val } from './Records';

type Connection = {
    id: string;
    name: string;
    type: string;
    state: string;
    detail: string;
    version: string;
};

type Props = {
    connections: Connection[];
    portability: { format: string; state: string; detail: string }[];
    update: (connection: Connection) => void;
    desk: Desk;
};

export function IntegrationSettings({ connections, portability, update, desk }: Props) {
    function configure(connection: Connection) {
        desk.show({
            title: `Configure ${connection.name}`,
            submit: 'Save configuration',
            body: <>
                <Field label="Connection detail" value={connection.detail} required />
                <Field label="Version" value={connection.version} />
                <Field label="State" value={connection.state} options={['connected', 'configured', 'planned', 'unavailable']} />
            </>,
            save: data => update({
                ...connection,
                detail: val(data, 'Connection detail'),
                version: val(data, 'Version'),
                state: val(data, 'State'),
            }),
        });
    }

    return <>
        <Card title="Connection points" subtitle="Institutional email and live classroom delivery are baseline; the rest are agreed with the institution">
            <div className="grid gap-3 lg:grid-cols-2">
                {connections.map(connection => (
                    <div key={connection.id} className="rounded-xl border border-ink-100 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[13.5px] font-semibold">{connection.name}</p>
                                <p className="mt-0.5 text-xs text-ink-500">{connection.type}</p>
                            </div>
                            {status(cap(connection.state), connection.state === 'planned' ? 'slate' : connection.state === 'unavailable' ? 'rose' : undefined)}
                        </div>
                        <p className="mt-3 text-xs text-ink-600">{connection.detail}</p>
                        <div className="mt-3 flex items-center justify-between">
                            <code className="text-[11px] text-ink-400">{connection.version}</code>
                            <Action size="sm" onClick={() => configure(connection)}>Configure</Action>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
        <Records title="Content portability" subtitle="Formats verified by round trip before migration scope is committed"
            columns={['Format', 'Support', 'Verification']}
            rows={portability.map(item => [item.format, status(item.state, item.state === 'planned' ? 'slate' : undefined), item.detail])} />
    </>;
}
