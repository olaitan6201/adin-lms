import type { ClassSession } from '@/types/learning/study';
import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Action } from '@/components/ui/controls/Action';
import { Table } from '@/components/ui/data-display/Table';

export function SessionTable({
    liveClasses,
    openDetails,
    openSchedule,
}: {
    liveClasses: ClassSession[];
    openDetails: (sessionId: string) => void;
    openSchedule: () => void;
}) {
    const { notify } = useWorkspaceOverlays();
    const rows = liveClasses.map((session) => [
        <div key="session" className="min-w-0">
            <p className="truncate font-medium text-ink-800">{session.title}</p>
            <p className="truncate font-mono text-[11px] text-ink-400">{session.course}</p>
        </div>,
        <span key="starts" className="text-[13px] text-ink-600">
            {session.starts}
        </span>,
        <span key="duration" className="text-[13px] text-ink-500">
            {session.duration}
        </span>,
        <Badge key="mode" tone={session.mode === 'Recording available' ? 'slate' : 'sky'}>
            {session.mode}
        </Badge>,
        <span key="attendance" className="text-[13px] tnum">
            {session.capacity === undefined
                ? `${session.attendees} joined`
                : `${session.attendees} / ${session.capacity}`}
        </span>,
        <Badge key="state" tone={session.state === 'completed' ? 'emerald' : 'amber'}>
            {session.state === 'completed' ? 'Completed' : 'Scheduled'}
        </Badge>,
        <div key="actions" className="flex justify-end gap-1.5">
            {session.state === 'completed' ? (
                <button type="button" className="btn btn-outline btn-sm" onClick={() => notify('Recording opened')}>
                    Recording
                </button>
            ) : (
                <button type="button" className="btn btn-outline btn-sm" onClick={() => openDetails(session.id)}>
                    Details
                </button>
            )}
        </div>,
    ]);

    return (
        <Card
            className="[&_th:last-child]:w-[110px]"
            title="Scheduled classes"
            subtitle="Meeting links are issued per session; no conferencing vendor is mandated"
            actions={
                <>
                    <Badge tone="sky">{liveClasses.filter((row) => row.state === 'scheduled').length} scheduled</Badge>
                    <Action
                        icon="plus"
                        variant="primary"
                        size="sm"
                        onClick={openSchedule}
                    >
                        Schedule class
                    </Action>
                </>
            }
        >
            <Table
                columns={['Session', 'Starts', 'Duration', 'Mode', 'Attendees', 'State', '']}
                rows={rows}
                rowKeys={liveClasses.map((session) => session.id)}
            />
        </Card>
    );
}
