import RecordForm, { field } from './RecordForm';
import type { CatalogueProps, Outcome } from './catalogueTypes';

export function OutcomeEditor({
    entries,
    courseOutcomes,
    programmeOutcomes,
    mappings,
    path,
}: Pick<CatalogueProps, 'entries' | 'courseOutcomes' | 'programmeOutcomes' | 'mappings'> & { path: string }) {
    const choices = entries.map((e) => ({ id: e.id, name: `${e.code}: ${e.title}` }));
    const outcomes = (rows: Outcome[]) => rows.map((o) => ({ id: o.id, name: o.statement }));
    const entryField = field('entry_id', 'Course', choices);

    return (
        <details>
            <summary>Configure prerequisites and outcomes</summary>
            <RecordForm
                title="Add prerequisite"
                action={`${path}/prerequisite`}
                fields={[entryField, field('required_entry_id', 'Requires', choices)]}
            />
            <RecordForm
                title="Add course outcome"
                action={`${path}/course-outcome`}
                fields={[entryField, field('statement', 'Course outcome')]}
            />
            <RecordForm
                title="Add programme outcome"
                action={`${path}/programme-outcome`}
                fields={[field('statement', 'Programme outcome')]}
            />
            <RecordForm
                title="Map outcomes"
                action={`${path}/mapping`}
                fields={[
                    field('course_outcome_id', 'Course outcome', outcomes(courseOutcomes)),
                    field('programme_outcome_id', 'Programme outcome', outcomes(programmeOutcomes)),
                ]}
            />
            {mappings.length > 0 && <RecordForm title="Remove mapping" action={`${path}/unmap`}
                fields={[field('mapping_id', 'Existing mapping', mappings.map(m => ({
                    id: m.id,
                    name: `${courseOutcomes.find(o => o.id === m.course_outcome_id)?.statement} → ${programmeOutcomes.find(o => o.id === m.programme_outcome_id)?.statement}`,
                })))]} />}
        </details>
    );
}
