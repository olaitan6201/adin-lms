import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import type { AttendanceBand, Learner, Session } from '@/types/assessments/attendance';
import { Sections } from './Sections';
import { AttendanceDistribution } from './attendance/AttendanceDistribution';
import { AttendanceHistory } from './attendance/AttendanceHistory';
import { AttendanceReport } from './attendance/AttendanceReport';
import { ClassRegisters } from './attendance/ClassRegisters';
import { RegisterEditor } from './attendance/RegisterEditor';
import { applyMarks, initialMarks, type Marks } from './attendance/registerMarks';

interface AttendanceDeskProps {
    lecturer?: boolean;
    attendanceSessions: Session[];
    learners: Learner[];
    bands: readonly AttendanceBand[];
    sessionCount: number;
    roster: Learner[];
    codeSuffix: string;
}

export default function AttendanceDesk({
    lecturer = false,
    attendanceSessions,
    learners,
    bands,
    sessionCount,
    roster,
    codeSuffix,
}: AttendanceDeskProps) {
    const [tab, setTab] = useState(0);
    const [sessions, setSessions] = useState(attendanceSessions);
    const [session, selectSession] = useState<Session>();
    const [registers, setRegisters] = useState<Record<string, Marks>>({});
    const description = lecturer
        ? 'Take a register for your classes and keep an eye on students whose attendance is slipping.'
        : 'Institution-wide attendance monitoring with per-student history and threshold alerts.';

    function closeRegister() {
        selectSession(undefined);
    }

    function saveRegister(marks: Marks) {
        if (!session) {
            return;
        }

        const original = registers[session.id] ?? initialMarks(session, roster);
        const updated = applyMarks(session, original, marks);
        setRegisters((previous) => ({ ...previous, [session.id]: marks }));
        setSessions((previous) => previous.map((row) => (row.id === session.id ? updated : row)));
        closeRegister();
    }

    return (
        <div className="assessment-view space-y-5">
            <PageHeader
                eyebrow="Attendance"
                title="Attendance"
                description={description}
                actions={
                    <>
                        <AttendanceReport sessions={sessions} />
                        <Action
                            variant="primary"
                            icon="calendarCheck"
                            disabled={!sessions.length}
                            onClick={() => selectSession(sessions[0])}
                        >
                            Open register
                        </Action>
                    </>
                }
            />
            <Sections
                counts={[sessions.length]}
                labels={['Class registers', 'Per-student history']}
                active={tab}
                change={setTab}
            />
            {tab === 0 ? (
                <>
                    <ClassRegisters sessions={sessions} open={selectSession} />
                    <AttendanceDistribution bands={bands} />
                </>
            ) : (
                <AttendanceHistory learners={learners} sessionCount={sessionCount} />
            )}
            {session && (
                <RegisterEditor
                    key={session.id}
                    session={session}
                    roster={roster}
                    codeSuffix={codeSuffix}
                    initial={registers[session.id] ?? initialMarks(session, roster)}
                    close={closeRegister}
                    save={saveRegister}
                />
            )}
        </div>
    );
}
