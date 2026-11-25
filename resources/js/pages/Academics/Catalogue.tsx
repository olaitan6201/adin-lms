import { Head, Link } from '@inertiajs/react';
import RecordForm, { field } from '../../components/academics/RecordForm';
import type { CatalogueProps } from '../../components/academics/catalogueTypes';
import { CatalogueCourses } from '../../components/academics/CatalogueCourses';
import { OutcomeCoverage } from '../../components/academics/OutcomeCoverage';
import { OutcomeEditor } from '../../components/academics/OutcomeEditor';
import { DeskHeading } from '../../components/academics/DeskHeading';

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
        <main className="portal-page space-y-5">
            <Head title="Curriculum catalogue" />
            <Link href="/courses" className="underline">
                My courses
            </Link>
            <DeskHeading area="Academic registry" title="Curriculum catalogue">
                Select a programme version to inspect course requirements, academic levels and outcome coverage.
            </DeskHeading>
            <nav aria-label="Curriculum versions">
                <h2 className="text-xl font-semibold">Programme versions</h2>
                {versions.length ? (
                    <ul>
                        {versions.map((v) => (
                            <li key={v.id}>
                                <Link className="underline" href={`${base}/${v.id}`}>
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
                <details>
                    <summary>Start a curriculum</summary>
                    <RecordForm
                        title="Create draft"
                        action={base}
                        fields={[
                            field('programme_id', 'Programme', programmes),
                            field('framework_revision', 'CCMAS framework revision'),
                        ]}
                    />
                </details>
            )}
            {version?.id && (
                <>
                    <h2 className="text-xl font-semibold">
                        {version.framework_revision} · v{version.version} ({version.status})
                    </h2>
                    {version.approved_at && (
                        <p className="break-words">
                            Approved {new Date(version.approved_at).toLocaleString()} by {approverName}
                        </p>
                    )}
                    <CatalogueCourses {...{ entries, levels, prerequisites, draft, path }} />
                    <OutcomeCoverage {...{ entries, courseOutcomes, programmeOutcomes, mappings }} />
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
