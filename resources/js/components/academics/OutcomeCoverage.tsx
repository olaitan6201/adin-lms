import type { CatalogueProps } from './catalogueTypes';
import { RegistryTable } from './RegistryPanel';

export function OutcomeCoverage({
    entries,
    courseOutcomes,
    programmeOutcomes,
    mappings,
}: Pick<CatalogueProps, 'entries' | 'courseOutcomes' | 'programmeOutcomes' | 'mappings'>) {
    const coverage = new Set(mappings.map(m => `${m.course_outcome_id}:${m.programme_outcome_id}`));
    return (
        <>
            <h3 className="card-title">Outcome coverage</h3>
            {!courseOutcomes.length && !programmeOutcomes.length && <p>No outcomes recorded.</p>}
            {courseOutcomes.length > 0 && <RegistryTable title="Outcome mapping matrix" columns={['Course outcome', ...programmeOutcomes.map((_, i) => `PO${i + 1}`)]}>
                {courseOutcomes.map(o => <tr key={o.id}>
                    <th scope="row" className="border-t border-ink-100 px-4 py-3 text-left text-sm">
                        <span className="block font-mono text-xs text-ink-500">{entries.find(e => e.id === o.curriculum_course_id)?.code}</span>
                        {o.statement}
                        {!programmeOutcomes.length && <span className="block font-normal">Unmapped</span>}
                    </th>
                    {programmeOutcomes.map(p => <td key={p.id}>
                        {coverage.has(`${o.id}:${p.id}`)
                            ? <span className="badge bg-brand-50 text-brand-700">Mapped</span>
                            : <span className="text-ink-500">Unmapped</span>}
                    </td>)}
                </tr>)}
            </RegistryTable>}
            <ul className="divide-y divide-ink-100">
                {programmeOutcomes.map((o, i) => (
                    <li key={o.id} className="py-2 text-sm">
                        <strong>PO{i + 1}</strong> · {o.statement} —{' '}
                        {mappings.some((m) => m.programme_outcome_id === o.id) ? 'Mapped' : 'Unmapped'}
                    </li>
                ))}
            </ul>
        </>
    );
}
