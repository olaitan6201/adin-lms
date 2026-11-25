import { HierarchyForms } from '../../components/academics/HierarchyForms';
import { Head, Link } from '@inertiajs/react';
import RecordForm, { type Choice } from '../../components/academics/RecordForm';

type Unit = Choice & {
    code: string;
    faculty_id?: string;
    department_id?: string;
};

type Calendar = {
    id: string;
    label: string;
    starts_on: string;
    ends_on: string;
};

type Props = {
    manage: boolean;
    faculties: Unit[];
    departments: Unit[];
    programmes: Unit[];
    levels: Calendar[];
    sessions: Calendar[];
    semesters: (Calendar & {
        session_id: string;
        position: number;
    })[];
};

export default function Hierarchy({
    manage,
    faculties,
    departments,
    programmes,
    levels,
    sessions,
    semesters,
}: Props) {
    return (
        <main className="mx-auto max-w-3xl space-y-5 px-5 py-12">
            <Head title="Academic organisation" />
            <Link className="underline" href="/courses">
                My courses
            </Link>
            <h1 className="text-3xl font-semibold">Academic organisation</h1>
            <h2 className="text-xl font-semibold">Faculties and programmes</h2>
            {!faculties.length && <p>No faculties in scope.</p>}
            {faculties.map((f) => (
                <section key={f.id}>
                    <h3 className="font-semibold">
                        {f.name} · {f.code}
                    </h3>
                    {departments
                        .filter((d) => d.faculty_id === f.id)
                        .map((d) => (
                            <details className="ml-4" key={d.id}>
                                <summary>{d.name}</summary>
                                <ul>
                                    {programmes
                                        .filter((p) => p.department_id === d.id)
                                        .map((p) => (
                                            <li key={p.id}>
                                                {p.code} · {p.name}
                                            </li>
                                        ))}
                                </ul>
                                {manage && (
                                    <RecordForm
                                        title="Delete department"
                                        action={`/academics/departments/${d.id}`}
                                        method="delete"
                                    />
                                )}
                            </details>
                        ))}
                </section>
            ))}
            <h2 className="text-xl font-semibold">Calendar and levels</h2>
            <p>Levels: {levels.map((l) => l.label).join(', ') || 'None configured'}</p>
            {!sessions.length && <p>No sessions configured.</p>}
            {sessions.map((s) => (
                <section key={s.id}>
                    <h3>
                        {s.label} · {s.starts_on} – {s.ends_on}
                    </h3>
                    <ul>
                        {semesters
                            .filter((t) => t.session_id === s.id)
                            .map((t) => (
                                <li key={t.id}>
                                    Semester {t.position}: {t.starts_on} – {t.ends_on}
                                </li>
                            ))}
                    </ul>
                </section>
            ))}
            {manage && <HierarchyForms {...{ faculties, departments, sessions }} records={{ faculties, departments, programmes, levels, sessions, semesters }} />}
        </main>
    );
}
