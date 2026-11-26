import { Field } from '@/components/registry/Desk';
import { Card } from '@/components/ui/layout/Card';
import type { ProgrammeVersion, CurriculumRevision } from '@/types/registry/curriculum';

export function RevisionDetails({
    revision,
    programme,
}: {
    revision: CurriculumRevision;
    programme: ProgrammeVersion;
}) {
    return (
        <>
            <Card title="Programme outcomes">
                {revision.outcomes.length ? (
                    <ol className="space-y-2 text-sm">
                        {revision.outcomes.map((outcome, index) => (
                            <li key={index}>
                                <code>PO{index + 1}</code>　{outcome}
                            </li>
                        ))}
                    </ol>
                ) : (
                    <p>No outcomes recorded for this programme.</p>
                )}
                {revision.state === 'draft' && (
                    <Field
                        label="Draft outcomes (one per line)"
                        type="textarea"
                        required
                        value={revision.outcomes.join('\n')}
                    />
                )}
            </Card>
            <Card title="Revision history">
                <ul>
                    {programme.revisions.map((r) => (
                        <li key={r.number}>
                            v{r.number} {r.state}
                            {r.approved && ` · ${r.approved}`}
                        </li>
                    ))}
                </ul>
            </Card>
        </>
    );
}
