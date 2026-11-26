import type { ClassSession, Room, Archive } from '@/types/learning/study';
import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import { SessionDrawer, type ClassroomSelection } from '@/components/learning/SessionDrawer';
import { LiveRoom, Recordings } from '@/components/learning/LiveRoom';
import { useState } from 'react';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Action } from '@/components/ui/controls/Action';
import { Table } from '@/components/ui/data-display/Table';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Note } from '@/components/learning/Parts';

function SessionTable({ liveClasses, label, openDetails, openSchedule }: {
    liveClasses: ClassSession[];
    label: string;
    openDetails: (sessionId: string) => void;
    openSchedule: () => void;
}) {
    const { notify } = useWorkspaceOverlays();
    const rows = liveClasses.map((session) => [
        <div className="min-w-0">
            <p className="truncate font-medium text-ink-800">{session.title}</p>
            <p className="truncate font-mono text-[11px] text-ink-400">{session.course}</p>
        </div>,
        <span className="text-[13px] text-ink-600">{session.starts}</span>,
        <span className="text-[13px] text-ink-500">{session.duration}</span>,
        <Badge tone={session.mode === 'Recording available' ? 'slate' : 'sky'}>{session.mode}</Badge>,
        <span className="text-[13px] tnum">
            {session.attendees} / {session.capacity}
        </span>,
        <Badge tone={session.state === 'completed' ? 'emerald' : 'amber'}>{session.state === 'completed' ? 'Completed' : 'Scheduled'}</Badge>,
        <div className="flex justify-end gap-1.5">
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
                    <Badge tone="sky">{label}</Badge>
                    <Action icon="plus" variant="primary" size="sm" onClick={openSchedule}>
                        Schedule class
                    </Action>
                </>
            }
        >
            <Table columns={['Session', 'Starts', 'Duration', 'Mode', 'Attendees', 'State', '']} rows={rows} rowKeys={liveClasses.map(session => session.id)} />
        </Card>
    );
}
export default function Classroom({
    liveClasses,
    room,
    archive,
    scheduleLabel,
}: {
    liveClasses: ClassSession[];
    room: Room;
    archive: Archive;
    scheduleLabel: string;
}) {
    const [panel, setPanel] = useState<{ selection: ClassroomSelection; open: boolean }>({ selection: { kind: 'schedule' }, open: false });
    const { selection, open } = panel;
    const openDetails = (sessionId: string) => setPanel({ selection: { kind: 'details', sessionId }, open: true });
    const openSchedule = () => setPanel({ selection: { kind: 'schedule' }, open: true });
    const session = selection.kind === 'details' ? liveClasses.find(row => row.id === selection.sessionId) : undefined;

    return (
        <div className="learning-surface">
            <PageHeader
                eyebrow="Classroom"
                title="Live classroom"
                description="Schedule live classes, announce times and links, and capture attendance and participation alongside asynchronous material."
                actions={
                    <>
                        <Action icon="chart" variant="outline">
                            Attendance report
                        </Action>
                        <Action icon="plus" variant="primary" onClick={openSchedule}>
                            Schedule class
                        </Action>
                    </>
                }
            />

            <div className="space-y-5">
                <LiveRoom room={room} />
                <SessionTable liveClasses={liveClasses} label={scheduleLabel} openDetails={openDetails} openSchedule={openSchedule} />
                <Recordings archive={archive} />
                <Note tone="sky">
                    Conferencing is vendor neutral. A session can run on any provider that issues a meeting link, and every session keeps its own
                    attendance and participation record.
                </Note>
            </div>
            <SessionDrawer session={session} selection={selection} open={open} closeSession={() => setPanel({ selection, open: false })} />
        </div>
    );
}
