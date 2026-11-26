import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import RecordForm, { type Field } from './RecordForm';
import type { Entry, CatalogueProps } from './catalogueTypes';
type Props = Pick<CatalogueProps, 'entries' | 'levels' | 'prerequisites'> & {
    entry: Entry;
    draft: boolean;
    path: string;
    entryFields: Field[];
};

function initialField(field: Field, entry: Entry) {
    const value = field.name === 'compulsory' ? Number(entry.compulsory) : entry[field.name as keyof Entry];
    return { ...field, initial: String(value) };
}

export function CatalogueCourseRow({ entry, levels, entries, prerequisites, draft, path, entryFields }: Props) {
    const requiredCodes = prerequisites
        .filter((p) => p.curriculum_course_id === entry.id)
        .map((p) => entries.find((course) => course.course_id === p.required_course_id)?.code)
        .join(', ');
    return (
        <Collapsible asChild>
            <tbody>
                <tr>
                    <td className="font-mono text-xs">{entry.code}</td>
                    <td className="font-medium">{entry.title}</td>
                    <td>
                        {entry.credits}
                        <span className="sm:hidden"> credits</span>
                    </td>
                    <td>
                        <span
                            className={
                                entry.compulsory ? 'badge bg-brand-50 text-brand-700' : 'badge bg-ink-50 text-ink-600'
                            }
                        >
                            {entry.compulsory ? 'Compulsory' : 'Elective'}
                        </span>
                    </td>
                    <td>
                        <CollapsibleTrigger asChild>
                            <Button type="button" variant="outline" aria-label={`Open ${entry.code} · ${entry.title}`}>
                                Open
                            </Button>
                        </CollapsibleTrigger>
                    </td>
                </tr>
                <CollapsibleContent asChild forceMount className="data-[state=closed]:hidden">
                    <tr>
                        <td colSpan={5} className="space-y-3">
                            <p>{entry.description}</p>
                            <p>{entry.outline}</p>
                            <p>
                                Level {levels.find((level) => level.id === entry.level_id)?.name} · {entry.credits}{' '}
                                credits · semester {entry.semester_position} ·{' '}
                                {entry.compulsory ? 'Compulsory' : 'Elective'}
                            </p>
                            <p>Prerequisites: {requiredCodes || 'None'}</p>
                            {draft && (
                                <RecordForm
                                    title="Save course"
                                    action={`${path}/entry`}
                                    fields={entryFields.map((field) => initialField(field, entry))}
                                />
                            )}
                        </td>
                    </tr>
                </CollapsibleContent>
            </tbody>
        </Collapsible>
    );
}
