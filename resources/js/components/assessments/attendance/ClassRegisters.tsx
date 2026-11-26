import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Table } from '@/components/ui/data-display/Table';
import { Card } from '@/components/ui/layout/Card';
import type { Session } from '@/types/assessments/attendance';
import { RecordName } from '../RecordDetails';
import { AttendanceReport } from './AttendanceReport';

interface ClassRegistersProps {
    sessions: Session[];
    open: (session: Session) => void;
}

export function ClassRegisters({ sessions, open }: ClassRegistersProps) {
    const rows = sessions.map((session) => {
        const { title, course, date, time, method, present, absent, late, state } = session;
        const tone = state === 'closed' ? 'emerald' : state === 'open' ? 'amber' : 'slate';

        return [
            <RecordName key="class" name={title} meta={`${course} · ${date} · ${time}`} />,
            <Badge key="method" tone={method === 'QR' ? 'sky' : 'slate'}>
                {method}
            </Badge>,
            <span key="present" className="tnum text-[13px] text-brand-700">
                {present}
            </span>,
            <span key="absent" className="tnum text-[13px] text-ink-500">
                {absent}
            </span>,
            <span key="late" className="tnum text-[13px] text-amber-700">
                {late}
            </span>,
            <Badge key="state" tone={tone}>
                {state.charAt(0).toUpperCase() + state.slice(1)}
            </Badge>,
            <Action key="actions" size="sm" onClick={() => open(session)}>
                {state === 'scheduled' ? 'Plan' : 'Register'}
            </Action>,
        ];
    });

    return (
        <Card
            className="session-list"
            title="Class registers"
            subtitle="Sample session methods. Use the register to mark attendance manually."
            actions={
                <>
                    <Badge>{sessions.length} sessions this week</Badge>
                    <AttendanceReport sessions={sessions} size="sm" />
                </>
            }
        >
            <Table
                columns={['Class', 'Method', 'Present', 'Absent', 'Late', 'State', '']}
                rows={rows}
                rowKeys={sessions.map((session) => session.id)}
            />
        </Card>
    );
}
