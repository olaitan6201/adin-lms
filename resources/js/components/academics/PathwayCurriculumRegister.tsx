import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { CoreEditor } from './CoreEditor';
import { CoreSelection } from './CoreSelection';
import { CurriculumEntries } from './CurriculumEntries';
import { CurriculumOutcomes } from './CurriculumOutcomes';
import { field } from './RecordForm';
import { RegistryPanel } from './RegistryPanel';
import { statusLabel, type AcademicCoreProps } from './academicCoreTypes';

type CurriculumRegisterProps = Pick<AcademicCoreProps, 'curriculum' | 'curricula' | 'pathways' | 'edit' | 'approve'> & {
    workspace: string;
    other?: string;
    actions: Omit<AcademicCoreProps['actions'], 'courseStore' | 'revisionStore' | 'revisions' | 'cohort' | 'adoption'>;
};

export function PathwayCurriculumRegister({
    workspace, other, curriculum, curricula, pathways, edit, approve, actions,
}: CurriculumRegisterProps) {
    const editableActions = curriculum?.status === 'draft' && edit ? actions : undefined;

    return (
        <RegistryPanel
            id="pathway-curriculum"
            title="Pathway curriculum"
            subtitle="Inspect a version’s assigned courses, requirements and outcome mappings."
        >
            <CoreSelection
                workspace={workspace}
                kind="curriculum"
                records={curricula}
                selected={curriculum?.id}
                other={other}
            />
            {edit && pathways.length > 0 && (
                <CoreEditor
                    title="New pathway curriculum"
                    submit="Start pathway curriculum"
                    action={actions.curriculumStore}
                    fields={[
                        field('academic_pathway_id', 'Academic pathway', pathways),
                        field('framework_revision', 'Framework revision'),
                    ]}
                />
            )}
            {edit && pathways.length === 0 && (
                <p className="text-sm text-muted-foreground">An active academic pathway is required to create a curriculum.</p>
            )}
            {curriculum && (
                <section key={curriculum.id} className="space-y-4">
                    <div className="flex flex-wrap items-baseline gap-3">
                        <h3 className="min-w-0 wrap-anywhere text-base font-semibold">{curriculum.name}</h3>
                        <Badge variant="outline">{statusLabel[curriculum.status]}</Badge>
                    </div>
                    <p className="wrap-anywhere text-sm">Framework: {curriculum.framework_revision}</p>
                    {curriculum.history && (
                        <section className="space-y-2 text-sm">
                            <h4 className="font-semibold">Changes since the fork</h4>
                            <Link className="text-brand-800 underline underline-offset-4" href={curriculum.history.sourceUrl}>
                                Open source version {curriculum.history.sourceVersion}
                            </Link>
                            {curriculum.history.changes.length > 0 ? (
                                <ul className="list-disc space-y-1 pl-5">
                                    {curriculum.history.changes.map(change => (
                                        <li key={change.id} className="wrap-anywhere">{change.description}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No academic content changes have been recorded since the fork.</p>
                            )}
                        </section>
                    )}
                    <CurriculumEntries curriculum={curriculum} actions={editableActions} />
                    <CurriculumOutcomes curriculum={curriculum} actions={editableActions} />
                    {editableActions?.review && (
                        <CoreEditor
                            title="Review draft curriculum"
                            submit="Mark curriculum reviewed"
                            action={editableActions.review}
                            description="Check the assigned courses, choice groups, prerequisites and outcome mappings before marking the draft reviewed."
                        />
                    )}
                    {curriculum.status === 'reviewed' && approve && actions.approve && (
                        <CoreEditor
                            title="Approve reviewed curriculum"
                            submit="Approve curriculum"
                            action={actions.approve}
                            description="The approved version is locked and can be adopted for an academic session and cohort."
                        />
                    )}
                    {curriculum.status === 'approved' && edit && actions.fork && (
                        <CoreEditor
                            title="Revise approved curriculum"
                            submit="Fork as draft"
                            action={actions.fork}
                            description="Create a new draft without changing the approved version or its adoption history."
                        />
                    )}
                </section>
            )}
        </RegistryPanel>
    );
}
