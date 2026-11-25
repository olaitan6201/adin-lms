import type { CatalogueProps } from './catalogueTypes';

export function OutcomeCoverage({
    entries,
    courseOutcomes,
    programmeOutcomes,
    mappings,
}: Pick<CatalogueProps, 'entries' | 'courseOutcomes' | 'programmeOutcomes' | 'mappings'>) {
    return (
        <>
            {' '}
            <h3 className="text-lg font-semibold">Outcome coverage</h3>
            {!courseOutcomes.length && !programmeOutcomes.length && <p>No outcomes recorded.</p>}
            <ul>
                {courseOutcomes.map((o) => (
                    <li key={o.id}>
                        {entries.find((e) => e.id === o.curriculum_course_id)?.code}: {o.statement} —{' '}
                        {mappings
                            .filter((m) => m.course_outcome_id === o.id)
                            .map(
                                (m) =>
                                    programmeOutcomes.find((p) => p.id === m.programme_outcome_id)
                                        ?.statement,
                            )
                            .join('; ') || 'Unmapped'}
                    </li>
                ))}
                {programmeOutcomes.map((o) => (
                    <li key={o.id}>
                        Programme: {o.statement} —{' '}
                        {mappings.some((m) => m.programme_outcome_id === o.id) ? 'Mapped' : 'Unmapped'}
                    </li>
                ))}
            </ul>
        </>
    );
}
