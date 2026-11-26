import { useState } from 'react';
import { type Desk } from '@/components/registry/Desk';
import { val } from '@/components/registry/Records';
import { Avatar } from './Person';
import type { StudentRecord, DirectorySummary } from '@/types/registry/people';
import { StudentProfileFields } from './StudentProfileFields';

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
                <StudentProfileFields
                    student={student}
                    directorySummary={directorySummary}
                    learningHistory={learningHistory}
                />
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
