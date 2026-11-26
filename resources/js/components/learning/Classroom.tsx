import { SessionTable } from './SessionTable';
import type { ClassSession, Room, Archive, SessionDraft } from '@/types/learning/study';
import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import { SessionDrawer, type ClassroomSelection } from '@/components/learning/SessionDrawer';
import { Recordings } from './Recordings';
import { LiveRoom } from '@/components/learning/LiveRoom';
import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Note } from '@/components/learning/Parts';

export default function Classroom({
    liveClasses,
    room,
    archive,
}: {
    liveClasses: ClassSession[];
    room: Room;
    archive: Archive;
}) {
    const [sessions, setSessions] = useState(liveClasses);
    const { notify, openDrawer } = useWorkspaceOverlays();
    const [panel, setPanel] = useState<{
        selection: ClassroomSelection;
        open: boolean;
    }>({
        selection: { kind: 'schedule' },
        open: false,
    });
    const { selection, open } = panel;
    const openDetails = (sessionId: string) => setPanel({ selection: { kind: 'details', sessionId }, open: true });
    const openSchedule = () => setPanel({ selection: { kind: 'schedule' }, open: true });
    const session = selection.kind === 'details' ? sessions.find((row) => row.id === selection.sessionId) : undefined;

    function showAttendance() {
        openDrawer({
            title: 'Attendance report',
            description: 'Sample attendance by classroom session',
            content: (
                <ul>
                    {sessions.map((row) => (
                        <li key={row.id}>{row.course} · {row.title}: {row.attendees} joined</li>
                    ))}
                </ul>
            ),
        });
    }

    function closeSession() {
        setPanel({ selection, open: false });
    }

    function saveSession({ title, course, duration, date, start, meetingLink, announcement }: SessionDraft) {
        const details = { ...session?.details, date, start, meetingLink, announcement };
        const starts =
            session?.details?.date === date && session.details.start === start ? session.starts : `${date}, ${start}`;
        const fields = { title, course, duration, starts, details };
        if (selection.kind === 'details') {
            if (!session?.details) {
                return;
            }

            setSessions((rows) => rows.map((row) => (row.id === selection.sessionId ? { ...row, ...fields } : row)));
        } else {
            const created = {
                ...fields,
                id: crypto.randomUUID(),
                attendees: 0,
                mode: 'Conferencing link',
                state: 'scheduled',
            };
            setSessions((rows) => [...rows, created]);
        }

        closeSession();
        notify('Class saved locally. No announcement was sent.');
    }

    return (
        <div className="learning-surface">
            <PageHeader
                eyebrow="Classroom"
                title="Live classroom"
                description="Schedule live classes, announce times and links, and capture attendance and participation alongside asynchronous material."
                actions={
                    <>
                        <Action icon="chart" variant="outline" onClick={showAttendance}>
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
                <SessionTable liveClasses={sessions} openDetails={openDetails} openSchedule={openSchedule} />
                <Recordings archive={archive} />
                <Note tone="sky">
                    Conferencing is vendor neutral. A session can run on any provider that issues a meeting link, and
                    every session keeps its own attendance and participation record.
                </Note>
            </div>
            <SessionDrawer
                session={session}
                selection={selection}
                open={open}
                closeSession={closeSession}
                save={saveSession}
            />
        </div>
    );
}
