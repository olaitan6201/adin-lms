import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Table } from '@/components/ui/data-display/Table';
import { Card } from '@/components/ui/layout/Card';
import type { Session } from '@/types/assessments/attendance';
import { RecordName } from '../Controls';
import { AttendanceReport } from './AttendanceReport';

interface ClassRegistersProps {
    sessions: Session[];
    open: (session: Session) => void;
}

export function ClassRegisters({ sessions, open }: ClassRegistersProps) {
    const rows = sessions.map(session => {
        const { title, course, date, time, method, present, absent, late, state } = session;
        const tone = state === 'closed' ? 'emerald' : state === 'open' ? 'amber' : 'slate';

        return [
            <RecordName name={title} meta={`${course} · ${date} · ${time}`} />,
            <Badge tone={method === 'QR' ? 'sky' : 'slate'}>{method}</Badge>,
            <span className="tnum text-[13px] text-brand-700">{present}</span>,
            <span className="tnum text-[13px] text-ink-500">{absent}</span>,
            <span className="tnum text-[13px] text-amber-700">{late}</span>,
            <Badge tone={tone}>{state.charAt(0).toUpperCase() + state.slice(1)}</Badge>,
            <Action size="sm" onClick={() => open(session)}>
                {state === 'scheduled' ? 'Plan' : 'Register'}
            </Action>,
        ];
    });

    return (
        <Card
            className="session-list"
            title="Class registers"
            subtitle="One register per scheduled class, with the source of the mark recorded"
            actions={<>
                <Badge>{sessions.length} sessions this week</Badge>
                <AttendanceReport sessions={sessions} size="sm" />
            </>}
        >
            <Table
                columns={['Class', 'Method', 'Present', 'Absent', 'Late', 'State', '']}
                rows={rows}
                rowKeys={sessions.map(session => session.id)}
            />
        </Card>
    );
}
