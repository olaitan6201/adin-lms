import { useState } from 'react';
import { type Desk } from '@/components/registry/Desk';
import { Records, status, cap, val } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import type { AcademicSession } from '@/types/registry/structure';
import { SessionFields } from './SessionFields';

export function AcademicSessions({
    academicSessions,
    windows,
    desk,
}: {
    academicSessions: AcademicSession[];
    windows: Record<string, [string, string][]>;
    desk: Desk;
}) {
    const [sessions, setSessions] = useState(academicSessions);

    function manage(session: AcademicSession) {
        desk.show({
            title: `${session.label} session settings`,
            subtitle: 'Dates, semesters and reporting cut-offs',
            cancel: 'Cancel',
            submit: 'Save changes',
            message: 'Session settings saved',
            body: <SessionFields session={session} windows={windows} />,
            save: (data) =>
                setSessions((records) =>
                    records.map((record) =>
                        record.id !== session.id
                            ? record
                            : {
                                  ...record,
                                  label: val(data, 'Session label'),
                                  startDate: val(data, 'Resumption date'),
                                  endDate: val(data, 'Session end'),
                                  start: val(data, 'Resumption date'),
                                  end: val(data, 'Session end'),
                                  semester: val(data, 'Semester'),
                              },
                    ),
                ),
        });
    }

    return (
        <Records
            tableClass="[&_th:last-child]:w-[110px] [&_td:last-child]:text-right"
            title="Academic sessions and semesters"
            subtitle="Session windows drive roster scope, course delivery and reporting periods"
            columns={['Session', 'State', 'Window', 'Semesters', '']}
            rows={sessions.map((session) => [
                <span key="session" className="font-medium text-ink-800">
                    {session.label}
                </span>,
                status(cap(session.state)),
                <span key="window" className="text-[13px] text-ink-500">
                    {session.start} to {session.end}
                </span>,
                <span key="semesters" className="text-[13px] text-ink-500">
                    {session.state === 'active' ? 'Semester 1 and 2' : 'Semesters 1 and 2'}
                </span>,
                <Action key="manage" size="sm" onClick={() => manage(session)}>
                    Manage
                </Action>,
            ])}
        />
    );
}
