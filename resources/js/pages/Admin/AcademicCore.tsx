import { Head, Link } from '@inertiajs/react';
import { CourseRegister } from '@/components/academics/CourseRegister';
import { CurriculumAdoptions } from '@/components/academics/CurriculumAdoptions';
import { PathwayCurriculumRegister } from '@/components/academics/PathwayCurriculumRegister';
import type { AcademicCoreProps } from '@/components/academics/academicCoreTypes';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/layout/PageHeader';

const sections = [
    ['course-register', 'Course register'],
    ['pathway-curriculum', 'Pathway curriculum'],
    ['cohorts-and-adoption', 'Cohorts and adoption'],
] as const;

export default function AcademicCore(props: AcademicCoreProps) {
    const { edit, approve, links, actions, course, curriculum } = props;

    return (
        <main className="academic-core min-w-0">
            <Head title="Academic core" />
            <PageHeader
                title="Academic core"
                description="Course revisions, pathway curricula and decisions to adopt approved versions."
                actions={
                    <>
                        {links.structure && (
                            <Button variant="outline" asChild>
                                <Link href={links.structure}>Academic structure</Link>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href={links.legacyCatalogue}>Legacy catalogue</Link>
                        </Button>
                    </>
                }
            />
            <div className="space-y-5">
                <nav aria-label="Academic core sections" className="flex flex-wrap gap-x-3">
                    {sections.map(([id, label]) => (
                        <Button
                            key={id}
                            variant="link"
                            className="min-h-11 px-0"
                            asChild
                        >
                            <a href={`#${id}`}>{label}</a>
                        </Button>
                    ))}
                </nav>
                {!edit && !approve && (
                    <p className="text-sm text-muted-foreground">You have read-only access to this register.</p>
                )}
                <CourseRegister
                    workspace={links.workspace}
                    other={curriculum?.id}
                    course={course}
                    courses={props.courses}
                    departments={props.departments}
                    edit={edit}
                    approve={approve}
                    actions={actions}
                />
                <PathwayCurriculumRegister
                    workspace={links.workspace}
                    other={course?.id}
                    curriculum={curriculum}
                    curricula={props.curricula}
                    pathways={props.pathways}
                    edit={edit}
                    approve={approve}
                    actions={actions}
                />
                <CurriculumAdoptions
                    curriculum={curriculum}
                    sessions={props.sessions}
                    cohorts={props.cohorts}
                    edit={edit}
                    approve={approve}
                    actions={actions}
                />
            </div>
        </main>
    );
}
