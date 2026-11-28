import { CoreEditor } from './CoreEditor';
import { field, type Choice, type Field } from './RecordForm';
import { RegistryTable } from './RegistryPanel';
import type { AcademicCoreProps, Curriculum } from './academicCoreTypes';

type OutcomeActions = Pick<AcademicCoreProps['actions'], 'courseOutcome' | 'programmeOutcome' | 'mapping'>;
const statement: Field = { name: 'statement', label: 'Outcome statement', type: 'textarea' };

export function CurriculumOutcomes({ curriculum, actions }: { curriculum: Curriculum; actions?: OutcomeActions }) {
    const entries = curriculum.entries.map(({ id, code, title }) => ({ id, name: `${code} — ${title}` }));
    const { courseOutcomes, programmeOutcomes, mappings } = curriculum;

    return (
        <section className="space-y-3 border-t border-border pt-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="min-w-0 space-y-2">
                    <h4 className="font-semibold">Course outcomes</h4>
                    <OutcomeList records={courseOutcomes} fallback="No course outcomes have been recorded." />
                    {actions?.courseOutcome && entries.length > 0 && (
                        <CoreEditor
                            title="New course outcome"
                            submit="Add course outcome"
                            action={actions.courseOutcome}
                            fields={[field('entry_id', 'Course', entries), statement]}
                        />
                    )}
                </div>
                <div className="min-w-0 space-y-2">
                    <h4 className="font-semibold">Programme outcomes</h4>
                    <OutcomeList records={programmeOutcomes} fallback="No programme outcomes have been recorded." />
                    {actions?.programmeOutcome && (
                        <CoreEditor
                            title="New programme outcome"
                            submit="Add programme outcome"
                            action={actions.programmeOutcome}
                            fields={[statement]}
                        />
                    )}
                </div>
            </div>
            <h4 className="font-semibold">Outcome mappings</h4>
            {mappings.length > 0 ? (
                <RegistryTable title="Outcome mappings" columns={['Course outcome', 'Programme outcome']}>
                    {mappings.map(({ course, programme }, index) => (
                        <tr key={JSON.stringify([course, programme, index])}>
                            <td className="wrap-anywhere whitespace-normal">{course}</td>
                            <td className="wrap-anywhere whitespace-normal">{programme}</td>
                        </tr>
                    ))}
                </RegistryTable>
            ) : (
                <p className="text-sm text-muted-foreground">No course outcomes have been mapped to programme outcomes.</p>
            )}
            {actions?.mapping && courseOutcomes.length > 0 && programmeOutcomes.length > 0 && (
                <CoreEditor
                    title="New outcome mapping"
                    submit="Map outcomes"
                    action={actions.mapping}
                    fields={[
                        field('course_outcome_id', 'Course outcome', courseOutcomes),
                        field('programme_outcome_id', 'Programme outcome', programmeOutcomes),
                    ]}
                />
            )}
        </section>
    );
}

function OutcomeList({ records, fallback }: { records: Choice[]; fallback: string }) {
    if (!records.length) {
        return <p className="text-sm text-muted-foreground">{fallback}</p>;
    }

    return (
        <ul className="list-disc space-y-1 pl-5 text-sm">
            {records.map(({ id, name }) => (
                <li key={id} className="wrap-anywhere whitespace-pre-wrap">{name}</li>
            ))}
        </ul>
    );
}
