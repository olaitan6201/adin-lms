import { NativeSelectOption } from '@/components/ui/native-select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import RecordForm, { field } from './RecordForm';
import type { Choice, Field } from './RecordForm';
import { useState } from 'react';
import { RegistryPanel } from './RegistryPanel';

type Row = {
    id: string;
    [key: string]: string | number | undefined;
};

export function HierarchyForms({
    faculties,
    departments,
    sessions,
    records,
}: {
    faculties: Choice[];
    departments: Choice[];
    records: Record<string, Row[]>;
    sessions: {
        id: string;
        label: string;
    }[];
}) {
    const [selection, select] = useState<Record<string, string>>({});
    const names = [field('code', 'Code'), field('name', 'Name')];
    const dates = [
        { name: 'starts_on', label: 'Starts on', type: 'date' },
        { name: 'ends_on', label: 'Ends on', type: 'date' },
    ];
    const forms: [string, string, Field[]][] = [
        ['faculty', 'faculties', names],
        ['department', 'departments', [field('faculty_id', 'Faculty', faculties), ...names]],
        ['programme', 'programmes', [field('department_id', 'Department', departments), ...names]],
        ['level', 'levels', [field('label', 'Level label')]],
        ['session', 'sessions', [field('label', 'Session label'), ...dates]],
        [
            'semester',
            'semesters',
            [
                field(
                    'session_id',
                    'Session',
                    sessions.map((s) => ({ id: s.id, name: s.label })),
                ),
                field('position', 'Semester number'),
                ...dates,
            ],
        ],
    ];

    return (
        <RegistryPanel title="Configure organisation" subtitle="Maintain institutional units and calendar records">
            {forms.map(([label, path, fields]) => (
                <Collapsible className="border-b py-2" key={path}>
                    <CollapsibleTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-auto min-h-9 max-w-full whitespace-normal text-start"
                        >
                            Maintain {label}
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent forceMount className="space-y-3 pt-3 data-[state=closed]:hidden">
                        <label className="grid gap-2 text-sm font-medium">
                            Record{' '}
                            <NativeSelect
                                value={selection[path] ?? ''}
                                onChange={(e) => select({ ...selection, [path]: e.target.value })}
                            >
                                <NativeSelectOption value="">New {label}</NativeSelectOption>
                                {records[path]?.map((r) => (
                                    <NativeSelectOption key={r.id} value={r.id}>
                                        {r.name ??
                                            r.label ??
                                            `${sessions.find((s) => s.id === r.session_id)?.label} · semester ${r.position}`}
                                    </NativeSelectOption>
                                ))}
                            </NativeSelect>
                        </label>
                        <RecordForm
                            key={selection[path] ?? ''}
                            title={selection[path] ? `Correct ${label}` : `Create ${label}`}
                            action={`/academics/organisation/${path}${selection[path] ? `/${selection[path]}` : ''}`}
                            method={selection[path] ? 'patch' : 'post'}
                            fields={fields.map((f) => ({
                                ...f,
                                initial: String(records[path]?.find((r) => r.id === selection[path])?.[f.name] ?? ''),
                            }))}
                        />
                    </CollapsibleContent>
                </Collapsible>
            ))}
        </RegistryPanel>
    );
}
