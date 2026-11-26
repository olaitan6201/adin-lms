import { CatalogueCourseRow } from './CatalogueCourseRow';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import RecordForm, { field } from './RecordForm';
import type { CatalogueProps } from './catalogueTypes';
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
            {entries.length > 0 && (
                <RegistryTable
                    grouped
                    title="Catalogue courses"
                    columns={['Code', 'Course', 'Credits', 'Requirement', 'Details']}
                >
                    {entries.map((e) => (
                        <CatalogueCourseRow
                            key={e.id}
                            entry={e}
                            {...{ entries, levels, prerequisites, draft, path, entryFields }}
                        />
                    ))}
                </RegistryTable>
            )}
            {draft && (
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-auto min-h-9 max-w-full whitespace-normal text-start"
                        >
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
