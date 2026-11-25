import RecordForm, { field } from './RecordForm';
import type { Choice, Field } from './RecordForm';
import { useState } from 'react';

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
        <section>
            <h2 className="text-xl font-semibold">Configure organisation</h2>
            {forms.map(([label, path, fields]) => (
                <details className="border-b py-2" key={path}>
                    <summary>Maintain {label}</summary>
                    <label>
                        Record{' '}
                        <select
                            className="border p-2"
                            value={selection[path] ?? ''}
                            onChange={(e) => select({ ...selection, [path]: e.target.value })}
                        >
                            <option value="">New {label}</option>
                            {records[path]?.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name ??
                                        r.label ??
                                        `${sessions.find((s) => s.id === r.session_id)?.label} · semester ${r.position}`}
                                </option>
                            ))}
                        </select>
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
                </details>
            ))}
        </section>
    );
}
