import { CoreEditor } from './CoreEditor';
import { CurriculumAssignmentEditor } from './CurriculumAssignmentEditor';
import { field } from './RecordForm';
import { RegistryTable } from './RegistryPanel';
import {
    categoryLabel,
    requirementLabel,
    type AcademicCoreProps,
    type Curriculum,
} from './academicCoreTypes';

type EntryActions = Pick<AcademicCoreProps['actions'], 'assignment' | 'assignmentUpdates' | 'choice' | 'prerequisite'>;

function asChoices(labels: Record<string, string>) {
    return Object.entries(labels).map(([id, name]) => ({ id, name }));
}

export function CurriculumEntries({ curriculum, actions }: {
    curriculum: Curriculum;
    actions?: EntryActions;
}) {
    const entryChoices = curriculum.entries.map(({ id, code, title, requirement_mode }) => ({
        id,
        name: `${code} — ${title}`,
        choice: requirement_mode === 'choice',
    }));
    const choiceEntries = entryChoices.filter(entry => entry.choice);

    return (
        <section className="space-y-3 border-t border-border pt-4">
            <h4 className="font-semibold">Curriculum courses</h4>
            {curriculum.entries.length > 0 ? (
                <RegistryTable
                    title="Curriculum courses"
                    columns={['Course', 'Level', 'Semester', 'Credits', 'Category', 'Requirement']}
                >
                    {curriculum.entries.map((entry) => (
                        <tr key={entry.id}>
                            <th scope="row" className="px-3 py-2 text-left wrap-anywhere">
                                {entry.code} — {entry.title}
                            </th>
                            <td>{entry.level}</td>
                            <td className="tabular-nums">{entry.semester_position}</td>
                            <td className="tabular-nums">{entry.credits}</td>
                            <td>{entry.category ? categoryLabel[entry.category] : 'Unclassified'}</td>
                            <td>{entry.requirement_mode ? requirementLabel[entry.requirement_mode] : 'Not configured'}</td>
                        </tr>
                    ))}
                </RegistryTable>
            ) : (
                <p className="text-sm text-muted-foreground">No courses are assigned to this version.</p>
            )}
            {actions && curriculum.entries.map(entry => (
                <CurriculumAssignmentEditor
                    key={entry.id}
                    entry={entry}
                    levels={curriculum.levels}
                    revisions={curriculum.revisions}
                    action={actions.assignmentUpdates[entry.id]}
                />
            ))}
            {actions?.assignment && (curriculum.revisions.length > 0 && curriculum.levels.length > 0 ? (
                <CoreEditor
                    title="Assign an approved course revision"
                    submit="Add assignment"
                    action={actions.assignment}
                    fields={[
                        field('course_revision_id', 'Course revision', curriculum.revisions),
                        field('programme_level_id', 'Programme level', curriculum.levels),
                        field('category', 'Category', asChoices(categoryLabel)),
                        field('requirement_mode', 'Requirement mode', asChoices(requirementLabel)),
                        { name: 'credits', label: 'Effective units', inputMode: 'decimal' },
                        { name: 'semester_position', label: 'Semester position', type: 'number', min: 1, max: 99 },
                    ]}
                />
            ) : (
                <p className="text-sm text-muted-foreground">
                    Assignment requires a programme level and an approved course revision in this department.
                </p>
            ))}
            <h4 className="font-semibold">Choice groups</h4>
            {curriculum.choices.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                    {curriculum.choices.map((group) => (
                        <li key={group.id} className="wrap-anywhere">
                            <strong>{group.code}:</strong>{' '}
                            {group.unresolvedOptions > 0 ? (
                                <>Unresolved choice group. Recorded limits: {group.minimum_selections}–{group.maximum_selections}. Options: {group.options.join(', ')}.</>
                            ) : (
                                <>Choose {group.minimum_selections}–{group.maximum_selections} from {group.options.join(', ')}.</>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">No choice groups have been recorded.</p>
            )}
            {actions?.choice && choiceEntries.length > 0 && (
                <CoreEditor
                    title="New choice group"
                    submit="Create choice group"
                    action={actions.choice}
                    fields={[
                        field('code', 'Group code'),
                        { name: 'minimum_selections', label: 'Minimum selections', type: 'number', min: 0 },
                        { name: 'maximum_selections', label: 'Maximum selections', type: 'number', min: 1, max: 500 },
                        { ...field('curriculum_course_ids[]', 'Course options', choiceEntries), multiple: true },
                    ]}
                />
            )}
            <h4 className="font-semibold">Prerequisites</h4>
            {curriculum.prerequisites.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                    {curriculum.prerequisites.map((prerequisite) => (
                        <li key={JSON.stringify([prerequisite.for, prerequisite.requires])} className="wrap-anywhere">
                            {prerequisite.for} requires {prerequisite.requires}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">No prerequisites have been recorded.</p>
            )}
            {actions?.prerequisite && entryChoices.length >= 2 && (
                <CoreEditor
                    title="New prerequisite"
                    submit="Add prerequisite"
                    action={actions.prerequisite}
                    fields={[
                        field('entry_id', 'Course', entryChoices),
                        field('required_entry_id', 'Required course', entryChoices),
                    ]}
                />
            )}
        </section>
    );
}
