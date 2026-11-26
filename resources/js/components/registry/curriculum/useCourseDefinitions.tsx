import { useState } from 'react';
import { type Desk } from '@/components/registry/Desk';
import { cap, val } from '@/components/registry/Records';
import type { CourseDefinition } from '@/types/registry/curriculum';
import { DefinitionFields } from './DefinitionFields';

function changeDefinition(
    records: CourseDefinition[],
    data: FormData,
    prerequisite: {
        title: string;
        code: string;
    },
    course?: CourseDefinition,
): CourseDefinition[] | string {
    const entry = {
        ...(course ?? {
            code: val(data, 'Course code'),
            title: val(data, 'Course title'),
            state: 'draft',
            type: 'Compulsory',
            department: '',
        }),
        units: Number(val(data, 'Credit units')),
        level: Number(val(data, 'Level')),
        semester: Number(val(data, 'Semester').slice(-1)),
        description: val(data, 'Description'),
        prereq: val(data, 'Prerequisites') === prerequisite.title ? prerequisite.code : val(data, 'Prerequisites'),
    };
    if (!course && records.some((record) => record.code.toUpperCase() === entry.code.toUpperCase()))
        return 'This course code is already in use.';

    return course ? records.map((record) => (record.code === course.code ? entry : record)) : [...records, entry];
}

export function useCourseDefinitions({
    catalogueEntries,
    prerequisite,
    selectedCourse,
    accountingOutcomes,
    desk,
}: {
    catalogueEntries: CourseDefinition[];
    prerequisite: {
        code: string;
        title: string;
    };
    selectedCourse: { definition: { code: string } };
    accountingOutcomes: string[];
    desk: Desk;
}) {
    const [courses, setCourses] = useState(catalogueEntries);

    function courseForm(course?: CourseDefinition) {
        desk.show({
            title: course ? `${course.code} · ${course.title}` : 'Add course',
            subtitle:
                course &&
                `${cap(course.state)} · ${course.units} credit units · Level ${course.level}, Semester ${course.semester}`,
            submit: 'Save',
            message: 'Course definition saved',
            body: <DefinitionFields {...{ course, courses, prerequisite, selectedCourse, accountingOutcomes }} />,
            save: (data) => {
                const next = changeDefinition(courses, data, prerequisite, course);
                if (typeof next === 'string') return next;

                setCourses(next);
            },
        });
    }

    return { courses, courseForm };
}
