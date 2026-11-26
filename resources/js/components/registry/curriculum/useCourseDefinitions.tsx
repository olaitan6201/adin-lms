import { useState } from 'react';
import { type Desk } from '@/components/registry/Desk';
import { cap, val } from '@/components/registry/Records';
import type { CourseDefinition } from '@/types/registry/curriculum';
import { DefinitionFields } from './DefinitionFields';
import { loadDefinitions, storeDefinitions } from './definitionDrafts';

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
            type: 'Compulsory',
            department: '',
        }),
        state: 'draft',
        revision: course && course.state !== 'draft' ? course.revision + 1 : course?.revision ?? 1,
        units: Number(val(data, 'Credit units')),
        level: Number(val(data, 'Level')),
        semester: Number(val(data, 'Semester').slice(-1)),
        description: val(data, 'Description'),
        prereq: val(data, 'Prerequisites') === prerequisite.title ? prerequisite.code : val(data, 'Prerequisites'),
    };
    if (!entry.code || !entry.title) {
        return 'Enter a course code and title.';
    }

    if (!Number.isSafeInteger(entry.units) || entry.units < 1) {
        return 'Credit units must be a positive whole number.';
    }

    if (!course && records.some((record) => record.code.toUpperCase() === entry.code.toUpperCase())) {
        return 'This course code is already in use.';
    }

    if (course?.state === 'draft') {
        return records.map((record) => record === course ? entry : record);
    }

    if (records.some((record) => record.code === course?.code && record.state === 'draft')) {
        return 'A draft already exists. Open its row to continue editing.';
    }

    return [...records, entry];
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
    const [courses, setCourses] = useState(() => loadDefinitions(catalogueEntries));

    function courseForm(course?: CourseDefinition) {
        desk.show({
            title: course ? `${course.code} · ${course.title}` : 'Add course',
            subtitle:
                course &&
                `${cap(course.state)} · ${course.units} credit units · Level ${course.level}, Semester ${course.semester}`,
            submit: 'Save',
            message: 'Draft course definition saved in this tab',
            body: <DefinitionFields {...{ course, courses, prerequisite, selectedCourse, accountingOutcomes }} />,
            save: (data) => {
                const next = changeDefinition(courses, data, prerequisite, course);
                if (typeof next === 'string') {
                    return next;
                }

                try {
                    storeDefinitions(next);
                } catch {
                    return 'This browser could not save the draft. Your edits are still open.';
                }

                setCourses(next);
            },
        });
    }

    return { courses, courseForm };
}
