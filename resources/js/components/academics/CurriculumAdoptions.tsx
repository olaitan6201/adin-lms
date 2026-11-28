import { CoreEditor } from './CoreEditor';
import { field, type Choice } from './RecordForm';
import { RegistryPanel, RegistryTable } from './RegistryPanel';
import type { AcademicCoreProps } from './academicCoreTypes';

type AdoptionProps = Pick<AcademicCoreProps, 'edit' | 'approve' | 'curriculum' | 'sessions' | 'cohorts'> & {
    actions: Pick<AcademicCoreProps['actions'], 'cohort' | 'adoption'>;
};

export function CurriculumAdoptions({ curriculum, sessions, cohorts, edit, approve, actions }: AdoptionProps) {
    const adoptionVersion: Choice[] = curriculum?.status === 'approved' ? [curriculum] : [];
    const decisions = curriculum?.adoptions ?? [];

    return (
        <RegistryPanel
            id="cohorts-and-adoption"
            title="Cohorts and adoption"
            subtitle="Record which approved version applies to a pathway, academic session and entry cohort."
        >
            {cohorts.length > 0 ? (
                <details>
                    <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium hover:underline focus-visible:outline-ring">
                        Registered entry cohorts
                    </summary>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                        {cohorts.map((cohort) => (
                            <li key={cohort.id} className="wrap-anywhere">{cohort.name}</li>
                        ))}
                    </ul>
                </details>
            ) : (
                <p className="text-sm text-muted-foreground">No entry cohorts have been registered.</p>
            )}
            {edit && (
                <CoreEditor
                    title="New entry cohort"
                    submit="Add cohort"
                    action={actions.cohort}
                    fields={[field('code', 'Code'), field('label', 'Label')]}
                />
            )}
            {approve && adoptionVersion.length > 0 && sessions.length > 0 && cohorts.length > 0 && (
                <CoreEditor
                    key={curriculum?.id}
                    title="New adoption decision"
                    submit="Record adoption"
                    action={actions.adoption}
                    description="This decision replaces the active decision for the same pathway, session and cohort. Earlier decisions remain in the register. Existing placements and enrolments are not changed."
                    fields={[
                        {
                            ...field('curriculum_id', 'Approved curriculum version', adoptionVersion),
                            initial: curriculum?.id,
                        },
                        field('academic_session_id', 'Academic session', sessions),
                        field('entry_cohort_id', 'Entry cohort', cohorts),
                        field('decision_reference', 'Decision reference'),
                        { name: 'reason', label: 'Reason', type: 'textarea' },
                    ]}
                />
            )}
            {approve && curriculum?.status === 'approved' && (!sessions.length || !cohorts.length) && (
                <p className="text-sm text-muted-foreground">An academic session and a registered entry cohort are required to record adoption.</p>
            )}
            <h3 className="font-semibold">Adoption history</h3>
            {!curriculum ? (
                <p className="text-sm text-muted-foreground">Open a curriculum version to view its pathway’s decisions.</p>
            ) : decisions.length > 0 ? (
                <RegistryTable
                    title="Adoption history"
                    columns={['Version', 'Session', 'Entry cohort', 'Decision reference', 'Reason', 'Status']}
                >
                    {decisions.map((decision) => (
                        <tr key={decision.id}>
                            <td className="wrap-anywhere whitespace-normal">{decision.version}</td>
                            <td>{decision.session}</td>
                            <td>{decision.cohort}</td>
                            <th scope="row" className="px-3 py-2 text-left wrap-anywhere">
                                {decision.decision_reference}
                            </th>
                            <td className="wrap-anywhere whitespace-pre-wrap">{decision.reason}</td>
                            <td>{decision.active ? 'Active' : 'Superseded'}</td>
                        </tr>
                    ))}
                </RegistryTable>
            ) : (
                <p className="text-sm text-muted-foreground">No adoption decisions have been recorded for this pathway.</p>
            )}
        </RegistryPanel>
    );
}
