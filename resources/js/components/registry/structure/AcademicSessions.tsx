import { useState } from 'react';
import { type Desk, Note, Field } from '@/components/registry/Desk';
import { Records, Details, status, cap, val } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import type { AcademicSession } from '@/types/registry/structure';

export function AcademicSessions({
    academicSessions,
    windows,
    desk,
}: {
    academicSessions: AcademicSession[];
    windows: [string, string][];
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
            body: (
                <>
                    <Field label="Session label" value={session.label} required />
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Resumption date" type="date" value={session.startDate} required />
                        <Field label="Session end" type="date" value={session.endDate} required />
                    </div>
                    <Field
                        label="Semester"
                        value={session.semester}
                        options={['First Semester', 'Second Semester']}
                    />
                    <section className="rounded-xl border border-ink-100 p-4">
                        <p className="text-[13px] font-semibold">Semester windows</p>
                        <Details entries={windows} />
                    </section>
                    <Note>
                        Roster imports and result publication are scoped to the active session. Changing these
                        dates does not alter historical records.
                    </Note>
                </>
            ),
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
                <span className="font-medium text-ink-800">{session.label}</span>,
                status(cap(session.state)),
                <span className="text-[13px] text-ink-500">
                    {session.start} to {session.end}
                </span>,
                <span className="text-[13px] text-ink-500">
                    {session.state === 'active' ? 'Semester 1 and 2' : 'Semesters 1 and 2'}
                </span>,
                <Action size="sm" onClick={() => manage(session)}>
                    Manage
                </Action>,
            ])}
        />
    );
}
