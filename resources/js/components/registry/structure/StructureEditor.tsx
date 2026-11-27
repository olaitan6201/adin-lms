import { useId, useState } from 'react';
import { Form } from '@inertiajs/react';
import { FormFeedback } from '@/components/forms/FormFeedback';
import { RecordField } from '@/components/academics/RecordField';
import { field, type Field } from '@/components/academics/RecordForm';
import { Action } from '@/components/ui/controls/Action';
import { MountedDialog } from '@/components/ui/overlays/MountedDialog';
import type { Selection, StructureKind, StructureProps } from './liveRecords';

const labels: Record<StructureKind, string> = {
    faculties: 'faculty',
    departments: 'department',
    programmes: 'programme',
    levels: 'academic level',
    sessions: 'session',
    semesters: 'semester',
};

function fieldsFor(kind: StructureKind, structure: StructureProps): Field[] {
    const name = [field('code', 'Code'), field('name', kind === 'programmes' ? 'Programme' : 'Name')];
    const dates = [
        { name: 'starts_on', label: 'Starts on', type: 'date' },
        { name: 'ends_on', label: 'Ends on', type: 'date' },
    ];

    switch (kind) {
        case 'faculties':
            return name;
        case 'departments':
            return [...name, field('faculty_id', 'Parent faculty', structure.faculties)];
        case 'programmes':
            return [...name, field('department_id', 'Department', structure.departments)];
        case 'levels':
            return [field('label', 'Level label')];
        case 'sessions':
            return [field('label', 'Session label'), ...dates];
        case 'semesters': {
            const sessions = structure.sessions.map(({ id, label }) => ({ id, name: label }));

            return [field('session_id', 'Session', sessions), field('position', 'Semester number'), ...dates];
        }
    }
}

export function StructureEditor({ selection, structure, close, saved }: {
    selection: Selection;
    structure: StructureProps;
    close: () => void;
    saved: () => void;
}) {
    const titleId = useId();
    const [unit, setUnit] = useState<'faculties' | 'departments'>('faculties');
    const kind = selection.kind === 'unit' ? unit : selection.kind;
    const record = selection.kind === 'unit' ? undefined : selection.record;
    const values: Record<string, unknown> = { ...record };
    const action = record ? `${structure.actions[kind]}/${record.id}` : structure.actions[kind];
    const title = selection.kind === 'unit'
        ? 'Add faculty or department'
        : `${record ? 'Manage' : 'Add'} ${labels[kind]}`;

    return (
        <MountedDialog
            labelledBy={titleId}
            close={close}
            className="fixed inset-y-0 right-0 ml-auto mr-0 h-dvh max-h-none w-full max-w-[560px] border-l border-ink-100 bg-white p-0 shadow-xl backdrop:bg-ink-950/45"
        >
            <Form
                key={kind}
                action={action}
                method={record ? 'patch' : 'post'}
                onSuccess={saved}
                className="flex h-full max-h-dvh flex-col"
            >
                {({ errors, processing }) => (
                    <>
                        <div className="border-b border-ink-100 p-5">
                            <h2 id={titleId} className="text-base font-semibold text-ink-900">{title}</h2>
                        </div>
                        <div className="flex-1 space-y-4 overflow-auto p-5">
                            <FormFeedback errors={errors}>
                                {selection.kind === 'unit' && (
                                    <label className="grid gap-1 text-sm">
                                        Type
                                        <select
                                            className="rounded-md border border-ink-300 bg-white p-2"
                                            value={unit}
                                            onChange={event => setUnit(event.target.value === 'departments' ? 'departments' : 'faculties')}
                                        >
                                            <option value="faculties">Faculty</option>
                                            <option value="departments">Department</option>
                                        </select>
                                    </label>
                                )}
                                {fieldsFor(kind, structure).map(item => (
                                    <RecordField
                                        key={item.name}
                                        field={{ ...item, initial: String(values[item.name] ?? '') }}
                                        error={errors[item.name]}
                                    />
                                ))}
                            </FormFeedback>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-ink-100 p-4">
                            <Action onClick={close} variant="outline">Cancel</Action>
                            <button className="btn btn-primary" type="submit" disabled={processing}>
                                {record ? 'Save changes' : `Add ${labels[kind]}`}
                            </button>
                        </div>
                    </>
                )}
            </Form>
        </MountedDialog>
    );
}
