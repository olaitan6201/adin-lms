import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { HierarchyForms } from '../../components/academics/HierarchyForms';
import { Head, Link } from '@inertiajs/react';
import RecordForm, { type Choice } from '../../components/academics/RecordForm';
import { DeskHeading } from '../../components/academics/DeskHeading';
import { RegistryPanel } from '@/components/academics/RegistryPanel';

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

export default function Hierarchy({ manage, faculties, departments, programmes, levels, sessions, semesters }: Props) {
    return (
        <main className="w-full min-w-0 space-y-5 wrap-anywhere">
            <Head title="Academic organisation" />
            <Link className="text-primary underline underline-offset-4" href="/courses">
                My courses
            </Link>
            <DeskHeading area="Academic registry" title="Academic organisation">
                Browse faculties, departments and programmes alongside the institutional calendar.
            </DeskHeading>
            <div className="grid items-start gap-5 xl:grid-cols-[2fr_1fr]">
                <RegistryPanel title="Faculties and programmes" subtitle="Faculty, department and programme assignment">
                    {!faculties.length && <p>No faculties in scope.</p>}
                    {faculties.map((f) => (
                        <section key={f.id} className="space-y-3 rounded-xl border border-ink-100 p-4">
                            <h3 className="flex items-center gap-3 text-sm font-semibold">
                                <span className="rounded-lg bg-ink-900 px-2 py-3 text-xs text-white">{f.code}</span>
                                {f.name}
                            </h3>
                            {departments
                                .filter((d) => d.faculty_id === f.id)
                                .map((d) => (
                                    <Collapsible className="rounded-lg border border-ink-100 bg-ink-50 p-3" key={d.id}>
                                        <CollapsibleTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-auto min-h-9 max-w-full whitespace-normal text-start"
                                            >
                                                {d.name}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent
                                            forceMount
                                            className="space-y-3 pt-3 data-[state=closed]:hidden"
                                        >
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
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))}
                        </section>
                    ))}
                </RegistryPanel>
                <RegistryPanel title="Calendar and levels" subtitle="Session windows and semester dates">
                    <p>Levels: {levels.map((l) => l.label).join(', ') || 'None configured'}</p>
                    {!sessions.length && <p>No sessions configured.</p>}
                    {sessions.map((s) => (
                        <section key={s.id} className="border-t border-ink-100 pt-3 text-sm">
                            <h3 className="font-semibold">
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
                </RegistryPanel>
            </div>
            {manage && (
                <HierarchyForms
                    {...{ faculties, departments, sessions }}
                    records={{ faculties, departments, programmes, levels, sessions, semesters }}
                />
            )}
        </main>
    );
}
