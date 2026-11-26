import { Records, status } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import type { CourseDefinition } from '@/types/registry/curriculum';

export function DefinitionRegister({
    courses,
    courseForm,
}: {
    courses: CourseDefinition[];
    courseForm: (course?: CourseDefinition) => void;
}) {
    return (
        <Records
            tableClass="[&_th:last-child]:w-[90px] [&_td:last-child]:text-right"
            title="Course catalogue"
            subtitle="Approved and draft course definitions with credit units, prerequisites and level placement"
            actions={
                <>
                    {status(`${courses.length} courses`)}
                    <Action
                        size="sm"
                        variant="primary"
                        icon="plus"
                        onClick={() => courseForm()}
                    >
                        Add course
                    </Action>
                </>
            }
            columns={['Code', 'Title', 'Units', 'Level', 'Type', 'Prerequisite', 'State', '']}
            rows={courses.map((course) => [
                <code key="code" className="text-xs font-medium text-ink-700">
                    {course.code}
                </code>,
                <span key="title" className="font-medium text-ink-800">
                    {course.title}
                </span>,
                <span key="units" className="text-[13px]">
                    {course.units}
                </span>,
                <span key="semester" className="text-[13px] text-ink-500">
                    L{course.level} S{course.semester}
                </span>,
                status(course.type, course.type === 'Compulsory' ? 'emerald' : 'slate'),
                <span key="prerequisites" className="text-[13px] text-ink-500">
                    {course.prereq}
                </span>,
                status(course.state, course.state === 'published' ? 'sky' : undefined),
                <Action key="edit" size="sm" onClick={() => courseForm(course)}>
                    Open
                </Action>,
            ])}
        />
    );
}
