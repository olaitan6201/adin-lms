import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import RecordForm, { field } from '../../components/academics/RecordForm';
import type { CatalogueProps } from '../../components/academics/catalogueTypes';
import { CatalogueCourses } from '../../components/academics/CatalogueCourses';
import { OutcomeCoverage } from '../../components/academics/OutcomeCoverage';
import { OutcomeEditor } from '../../components/academics/OutcomeEditor';
import { DeskHeading } from '../../components/academics/DeskHeading';
import { RegistryPanel } from '@/components/academics/RegistryPanel';

export default function Catalogue({
    edit,
    approve,
    approverName,
    versions,
    version,
    entries,
    levels,
    programmes,
    courseOutcomes,
    programmeOutcomes,
    mappings,
    prerequisites,
}: CatalogueProps) {
    const base = '/academics/curriculum';
    const path = `${base}/${version?.id}`;

    const draft = edit && version?.status === 'draft';

    return (
        <main className="w-full min-w-0 space-y-5 wrap-anywhere">
            <Head title="Curriculum catalogue" />
            <Link href="/courses" className="text-primary underline underline-offset-4">
                My courses
            </Link>
            <DeskHeading area="Academic registry" title="Curriculum catalogue">
                Select a programme version to inspect course requirements, academic levels and outcome coverage.
            </DeskHeading>
            <RegistryPanel title="Programme versions" subtitle="Select a curriculum revision">
                <nav aria-label="Curriculum versions">
                    {versions.length ? (
                        <ul className="flex flex-wrap gap-2">
                            {versions.map((v) => (
                                <li key={v.id}>
                                    <Link
                                        className={
                                            v.id === version?.id ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'
                                        }
                                        aria-current={v.id === version?.id ? 'page' : undefined}
                                        href={`${base}/${v.id}`}
                                    >
                                        {v.name} · v{v.version} · {v.status}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No versions yet.</p>
                    )}
                </nav>
                {edit && (
                    <Collapsible>
                        <CollapsibleTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-auto min-h-9 max-w-full whitespace-normal text-start"
                            >
                                Start a curriculum
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent forceMount className="space-y-3 pt-3 data-[state=closed]:hidden">
                            <RecordForm
                                title="Create draft"
                                action={base}
                                fields={[
                                    field('programme_id', 'Programme', programmes),
                                    field('framework_revision', 'CCMAS framework revision'),
                                ]}
                            />
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </RegistryPanel>
            {version?.id && (
                <>
                    <RegistryPanel
                        title="Course catalogue"
                        subtitle={`${version.framework_revision} · v${version.version} (${version.status})`}
                    >
                        {version.approved_at && (
                            <p className="break-words">
                                Approved {new Date(version.approved_at).toLocaleString()} by {approverName}
                            </p>
                        )}
                        <CatalogueCourses {...{ entries, levels, prerequisites, draft, path }} />
                    </RegistryPanel>
                    <RegistryPanel title="Outcome mapping" subtitle="Course outcomes and programme coverage">
                        <OutcomeCoverage {...{ entries, courseOutcomes, programmeOutcomes, mappings }} />
                    </RegistryPanel>
                    {draft && (
                        <>
                            <OutcomeEditor {...{ entries, courseOutcomes, programmeOutcomes, mappings, path }} />
                            <RecordForm title="Mark reviewed" action={`${path}/review`} />
                        </>
                    )}
                    {approve && version.status === 'reviewed' && (
                        <RecordForm title="Approve reviewed version" action={`${path}/approve`} />
                    )}
                    {edit && version.status === 'approved' && (
                        <RecordForm title="Edit as new draft" action={`${path}/fork`} />
                    )}
                </>
            )}
        </main>
    );
}
