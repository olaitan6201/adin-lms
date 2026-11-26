import { useState } from 'react';
import { type Desk, Field } from '@/components/registry/Desk';
import { Note } from '@/components/ui/feedback/Note';
import { cap, val } from '@/components/registry/Records';
import type { CourseDefinition } from '@/types/registry/curriculum';

function changeDefinition(
    records: CourseDefinition[],
    data: FormData,
    prerequisite: { title: string; code: string },
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

function DefinitionFields({
    course,
    courses,
    prerequisite,
    selectedCourse,
    accountingOutcomes,
}: {
    course?: CourseDefinition;
    courses: CourseDefinition[];
    prerequisite: { code: string; title: string };
    selectedCourse: { definition: { code: string } };
    accountingOutcomes: string[];
}) {
    return (
        <>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Course code" value={course?.code} readOnly={!!course} required />
                <Field label="Credit units" type="number" value={course?.units ?? 3} required />
                <Field
                    label="Level"
                    value={course?.level}
                    options={
                        course
                            ? Array.from(new Set([String(course.level), '200']))
                            : ['100', '200', '300', '400', '500']
                    }
                />
                <Field
                    label="Semester"
                    value={`Semester ${course?.semester ?? 1}`}
                    options={['Semester 1', 'Semester 2']}
                />
            </div>
            {!course && <Field label="Course title" required />}
            <Field label="Description" type="textarea" value={course?.description} />
            <Field
                label="Prerequisites"
                value={course?.prereq === prerequisite.code ? prerequisite.title : course?.prereq}
                options={
                    course
                        ? [course.prereq === prerequisite.code ? prerequisite.title : course.prereq, 'None']
                        : ['None', ...courses.map((record) => record.code)]
                }
            />
            {course?.code === selectedCourse.definition.code && (
                <section className="rounded-xl border border-ink-100 p-4">
                    <p className="mb-2 text-[13px] font-semibold">Learning outcomes</p>
                    <ul className="list-disc space-y-2 pl-5 text-sm">
                        {accountingOutcomes.map((text) => (
                            <li key={text}>{text}</li>
                        ))}
                    </ul>
                </section>
            )}
            <Note>
                Changing a published course definition creates a new curriculum version. Existing offerings and
                results keep the version they were created under.
            </Note>
        </>
    );
}

export function useCourseDefinitions({
    catalogueEntries,
    prerequisite,
    selectedCourse,
    accountingOutcomes,
    desk,
}: {
    catalogueEntries: CourseDefinition[];
    prerequisite: { code: string; title: string };
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
