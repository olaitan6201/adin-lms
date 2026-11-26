import { Action } from '@/components/ui/controls/Action';
import { type Desk, exportRecords } from './Desk';
import { cap, Details, Records, status } from './Records';

type Event = { title: string; detail: string; level: string; time: string };
type Entry = { when: string; who: string; action: string; detail: string; ip: string };

export function SecurityAudit({ events, audit, desk }: { events: Event[]; audit: Entry[]; desk: Desk }) {
    function investigate(event: Event) {
        desk.show({
            title: event.title,
            subtitle: event.detail,
            body: <Details entries={[['Severity', cap(event.level)], ['When', event.time]]} />,
        });
    }

    return <>
        <Records title="Security events" subtitle="Failed logins, revoked sessions, rejected uploads and enrolment events"
            tableClass="[&_th:last-child]:w-[120px] [&_td:last-child]:text-right"
            actions={status(`${events.length} in 24 hours`, 'amber')}
            columns={['Event', 'Severity', 'When', '']}
            rows={events.map(event => [
                <div>{event.title}<p className="text-xs text-ink-500">{event.detail}</p></div>,
                status(cap(event.level), event.level === 'high' ? 'rose' : event.level === 'medium' ? 'amber' : 'slate'),
                event.time,
                <Action size="sm" onClick={() => investigate(event)}>Investigate</Action>,
            ])} />
        <Records title="Audit log" subtitle="Who changed what, when and from where"
            actions={<Action size="sm" icon="download" onClick={() => exportRecords('audit-log', audit)}>Export log</Action>}
            columns={['When', 'Who', 'Action', 'Detail', 'Source']}
            rows={audit.map(entry => [entry.when, entry.who, status(entry.action), entry.detail, entry.ip])} />
    </>;
}
