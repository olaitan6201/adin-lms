import { type Desk, Field } from '@/components/registry/Desk';
import { Records, Metrics, status, cap } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import { Person } from './Person';
import type { StudentRecord, DirectorySummary } from '@/types/registry/people';

export function StudentRegister({
    students,
    editStudent,
    directorySummary,
    studentMetrics,
    desk,
}: {
    students: StudentRecord[];
    editStudent: (student: StudentRecord) => void;
    directorySummary: DirectorySummary;
    studentMetrics: [string, string, string?][];
    desk: Desk;
}) {
    function importRoster() {
        desk.show({
            title: 'Import roster',
            body: <Field label="Roster file" type="file" required />,
            submit: 'Import',
            previewNotice: 'Roster file selected for review',
        });
    }

    return (
        <Records
            tableClass="[&_th:last-child]:w-[90px] [&_td:last-child]:text-right"
            title="Student records"
            subtitle="Provisioned learning profiles linked to the enrolment feed"
            actions={
                <>
                    {status(`${directorySummary.students.toLocaleString('en-US')} total`, 'emerald')}
                    <Action variant="primary" size="sm" icon="upload" onClick={importRoster}>
                        Import roster
                    </Action>
                </>
            }
            columns={['Student', 'Programme', 'Level', 'Attendance', 'GPA', 'Status', '']}
            rows={students.map((student) => [
                <Person name={student.name} id={student.matric} />,
                student.programme,
                status(`Level ${student.level}`),
                `${student.attendance}%`,
                student.gpa ? student.gpa.toFixed(2) : '-',
                status(
                    student.status === 'pending' ? 'Pending activation' : cap(student.status),
                    student.status === 'active' ? 'emerald' : student.status === 'pending' ? 'sky' : 'amber',
                ),
                <Action size="sm" onClick={() => editStudent(student)}>
                    Open
                </Action>,
            ])}
        >
            <Metrics rows={studentMetrics} />
        </Records>
    );
}
