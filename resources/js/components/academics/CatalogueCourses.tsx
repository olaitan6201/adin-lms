import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import RecordForm, { field } from './RecordForm';
import type { Entry, CatalogueProps } from './catalogueTypes';
import { RegistryTable } from './RegistryPanel';

export function CatalogueCourses({
    entries,
    levels,
    prerequisites,
    draft,
    path,
}: Pick<CatalogueProps, 'entries' | 'levels' | 'prerequisites'> & {
    draft: boolean;
    path: string;
}) {
    const entryFields = [
        field('code', 'Catalogue code'),
        field('title', 'Title'),
        field('description', 'Description'),
        field('outline', 'Outline'),
        field('credits', 'Credits'),
        field('level_id', 'Level', levels),
        field('semester_position', 'Semester number'),
        field('compulsory', 'Requirement', [
            { id: '1', name: 'Compulsory' },
            { id: '0', name: 'Elective' },
        ]),
    ];

    return (
        <>
            {entries.length === 0 && <p>No courses in this version.</p>}
            {entries.length > 0 && <RegistryTable grouped title="Catalogue courses" columns={['Code', 'Course', 'Credits', 'Requirement', 'Details']}>
            {entries.map((e) => (
                <Collapsible key={e.id} asChild><tbody>
                    <tr>
                        <td className="font-mono text-xs">{e.code}</td>
                        <td className="font-medium">{e.title}</td><td>{e.credits}<span className="sm:hidden"> credits</span></td>
                        <td><span className={e.compulsory ? 'badge bg-brand-50 text-brand-700' : 'badge bg-ink-50 text-ink-600'}>{e.compulsory ? 'Compulsory' : 'Elective'}</span></td>
                        <td>
                    <CollapsibleTrigger asChild>
                        <Button type="button" variant="outline" aria-label={`Open ${e.code} · ${e.title}`}>
                            Open
                        </Button>
                    </CollapsibleTrigger>
                        </td>
                    </tr>
                    <CollapsibleContent asChild forceMount className="data-[state=closed]:hidden"><tr><td colSpan={5} className="space-y-3">
                        <p>{e.description}</p>
                        <p>{e.outline}</p>
                        <p>
                            Level {levels.find((level) => level.id === e.level_id)?.name} · {e.credits} credits · semester{' '}
                            {e.semester_position} · {e.compulsory ? 'Compulsory' : 'Elective'}
                        </p>
                        <p>
                            Prerequisites:{' '}
                            {prerequisites
                                .filter((p) => p.curriculum_course_id === e.id)
                                .map((p) => entries.find((c) => c.course_id === p.required_course_id)?.code)
                                .join(', ') || 'None'}
                        </p>
                        {draft && (
                            <RecordForm
                                title="Save course"
                                action={`${path}/entry`}
                                fields={entryFields.map((f) => ({
                                    ...f,
                                    initial:
                                        f.name === 'compulsory'
                                            ? e.compulsory
                                                ? '1'
                                                : '0'
                                            : String(e[f.name as keyof Entry]),
                                }))}
                            />
                        )}
                    </td></tr></CollapsibleContent>
                    </tbody>
                </Collapsible>
            ))}</RegistryTable>}
            {draft && (
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <Button type="button" variant="outline" className="h-auto min-h-9 max-w-full whitespace-normal text-start">
                            Add catalogue course
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent forceMount className="space-y-3 pt-3 data-[state=closed]:hidden">
                        <RecordForm title="Save course" action={`${path}/entry`} fields={entryFields} />
                    </CollapsibleContent>
                </Collapsible>
            )}
        </>
    );
}
