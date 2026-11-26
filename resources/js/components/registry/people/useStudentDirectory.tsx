import { useState } from 'react';
import { type Desk, Field } from '@/components/registry/Desk';
import { Note } from '@/components/ui/feedback/Note';
import { Details, cap, val } from '@/components/registry/Records';
import { Card } from '@/components/ui/layout/Card';
import { Avatar } from './Person';
import type { StudentRecord, DirectorySummary } from '@/types/registry/people';

export function useStudentDirectory({
    studentDirectory,
    directorySummary,
    learningHistory,
    desk,
}: {
    studentDirectory: StudentRecord[];
    directorySummary: DirectorySummary;
    learningHistory: [string, string][];
    desk: Desk;
}) {
    const [students, setStudents] = useState(studentDirectory);

    function editStudent(student: StudentRecord) {
        desk.show({
            title: student.name,
            portrait: <Avatar name={student.name} large />,
            subtitle: student.matric,
            submit: 'Save changes',
            message: 'Student profile saved',
            body: (
                <>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Programme" value={student.programme} required />
                        <Field
                            label="Level"
                            value={student.level}
                            options={Array.from(new Set([String(student.level), '300', '200', '100']))}
                        />
                        <Field label="Email" value={student.email} type="email" />
                        <Field
                            label="Status"
                            value={cap(student.status)}
                            options={Array.from(new Set(['Active', 'At risk', 'Suspended', cap(student.status)]))}
                        />
                    </div>
                    <Card title="Learning history" subtitle="Enrolment and performance retained across sessions">
                        {student.id === directorySummary.historyStudentId ? (
                            <Details entries={learningHistory} />
                        ) : (
                            'No history shown.'
                        )}
                    </Card>
                    <Note>
                        Guardian access is off for this student. A guardian view can be enabled only with recorded
                        consent.
                    </Note>
                </>
            ),
            save: (data) =>
                setStudents((all) =>
                    all.map((record) =>
                        record.id !== student.id
                            ? record
                            : {
                                  ...record,
                                  email: val(data, 'Email'),
                                  status: val(data, 'Status').toLowerCase(),
                                  programme: val(data, 'Programme'),
                                  level: Number(val(data, 'Level')),
                              },
                    ),
                ),
        });
    }
    return { students, editStudent };
}
