import RecordForm, { field } from './RecordForm';
import type { Choice, Field } from './RecordForm';

export function HierarchyForms({
    faculties,
    departments,
    sessions,
}: {
    faculties: Choice[];
    departments: Choice[];
    sessions: {
        id: string;
        label: string;
    }[];
}) {
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
                    <summary>Add {label}</summary>
                    <RecordForm
                        title={`Create ${label}`}
                        action={`/academics/organisation/${path}`}
                        fields={fields}
                    />
                </details>
            ))}
        </section>
    );
}
