import { Field } from '@/components/registry/Desk';
import { Note } from '@/components/ui/feedback/Note';
import { Details, cap } from '@/components/registry/Records';
import { Card } from '@/components/ui/layout/Card';
import type { StudentRecord, DirectorySummary } from '@/types/registry/people';

export function StudentProfileFields({
    student,
    directorySummary,
    learningHistory,
}: {
    student: StudentRecord;
    directorySummary: DirectorySummary;
    learningHistory: [string, string][];
}) {
    return (
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
                Guardian access is off for this student. A guardian view can be enabled only with recorded consent.
            </Note>
        </>
    );
}
