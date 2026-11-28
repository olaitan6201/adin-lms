import { CoreEditor } from './CoreEditor';
import { CoreSelection } from './CoreSelection';
import { CourseRevisionRecord, revisionFields } from './CourseRevisionRecord';
import { field } from './RecordForm';
import { RegistryPanel } from './RegistryPanel';
import type { AcademicCoreProps } from './academicCoreTypes';

type CourseRegisterProps = Pick<AcademicCoreProps, 'course' | 'courses' | 'departments' | 'edit' | 'approve'> & {
    workspace: string;
    other?: string;
    actions: Pick<AcademicCoreProps['actions'], 'courseStore' | 'revisionStore' | 'revisions'>;
};

export function CourseRegister({ workspace, other, course, courses, departments, edit, approve, actions }: CourseRegisterProps) {
    return (
        <RegistryPanel
            id="course-register"
            title="Course register"
            subtitle="Department-owned course identities and numbered course revisions."
        >
            <CoreSelection
                workspace={workspace}
                kind="course"
                records={courses}
                selected={course?.id}
                other={other}
            />
            {edit && departments.length > 0 && (
                <CoreEditor
                    title="New course identity"
                    submit="Add course"
                    action={actions.courseStore}
                    fields={[field('department_id', 'Department', departments), field('code', 'Course code')]}
                />
            )}
            {edit && departments.length === 0 && (
                <p className="text-sm text-muted-foreground">Add a department in Academic structure before creating a course.</p>
            )}
            {course && (
                <section key={course.id} className="space-y-3">
                    <h3 className="wrap-anywhere text-base font-semibold">{course.name}</h3>
                    {edit && actions.revisionStore && (
                        <CoreEditor
                            title="New course revision"
                            submit="Add revision"
                            action={actions.revisionStore}
                            fields={revisionFields()}
                        />
                    )}
                    {course.revisions.length > 0 ? (
                        <ol>
                            {course.revisions.map((revision) => (
                                <CourseRevisionRecord
                                    key={revision.id}
                                    revision={revision}
                                    actions={actions.revisions[revision.id]}
                                    edit={edit}
                                    approve={approve}
                                />
                            ))}
                        </ol>
                    ) : (
                        <p className="text-sm text-muted-foreground">No revisions have been recorded for this course.</p>
                    )}
                </section>
            )}
        </RegistryPanel>
    );
}
