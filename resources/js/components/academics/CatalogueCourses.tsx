import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import RecordForm, { field } from './RecordForm';
import type { Entry, CatalogueProps } from './catalogueTypes';

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
            {entries.map((e) => (
                <Collapsible key={e.id}>
                    <CollapsibleTrigger asChild>
                        <Button type="button" variant="outline" className="h-auto min-h-9 max-w-full whitespace-normal text-start">
                            {e.code} · {e.title}
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent forceMount className="space-y-3 pt-3 data-[state=closed]:hidden">
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
                    </CollapsibleContent>
                </Collapsible>
            ))}
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
