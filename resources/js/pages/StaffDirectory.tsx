import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import RecordForm, { field } from '../components/academics/RecordForm';

import { ChangeAllocation, RegisterLecturer, type DepartmentOption } from '../components/staff/StaffForms';

type Staff = {
    id: string;
    staff_number: string;
    full_name: string;
    department: string;
    offerings: string[];
};

type Props = {
    staff: Staff[];
    departments: DepartmentOption[];
    previous: string | null;
    next: string | null;
};

export default function StaffDirectory({ staff, departments, previous, next }: Props) {
    return (
        <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 wrap-anywhere px-4 py-6 sm:px-6 lg:px-8">
            <Head title="Lecturer directory" />
            <Link href="/courses" className="text-primary underline underline-offset-4">
                My courses
            </Link>
            <header className="min-w-0 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Staff administration</p>
                <h1 className="break-words text-3xl font-semibold tracking-tight">Lecturer directory</h1>
                <p>Review teaching records, update departments and manage class allocations.</p>
            </header>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <section>
                    <h2 className="text-xl font-semibold tracking-tight">Registered staff</h2>
                    {staff.length ? (
                        <ul className="divide-y">
                            {staff.map((s) => (
                                <li key={s.staff_number} className="py-3">
                                    <strong>{s.full_name}</strong> · {s.staff_number} · {s.department}
                                    <p>
                                        <Link href={`/staff/${s.id}/activity`} className="text-primary underline underline-offset-4">
                                            View teaching activity
                                        </Link>
                                    </p>
                                    <Collapsible>
                                        <CollapsibleTrigger asChild>
                                            <Button type="button" variant="outline" className="h-auto min-h-9 max-w-full whitespace-normal text-start">
                                                Transfer department
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent forceMount className="space-y-3 pt-3 data-[state=closed]:hidden">
                                            <RecordForm
                                                method="patch"
                                                title="Save department"
                                                action={`/staff/${s.id}/department`}
                                                fields={[field('department_id', 'New department', departments)]}
                                            />
                                        </CollapsibleContent>
                                    </Collapsible>
                                    <Collapsible>
                                        <CollapsibleTrigger asChild>
                                            <Button type="button" variant="outline" className="h-auto min-h-9 max-w-full whitespace-normal text-start">
                                                Teaching allocations ({s.offerings.length})
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent forceMount className="space-y-3 pt-3 data-[state=closed]:hidden">
                                            {s.offerings.length ? (
                                                <ul className="list-inside list-disc">
                                                    {s.offerings.map((id) => (
                                                        <li key={id}>{id}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p>No teaching allocations.</p>
                                            )}
                                        </CollapsibleContent>
                                    </Collapsible>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No lecturer profiles yet.</p>
                    )}
                    {previous && <Link href={previous}>Previous page</Link>}{' '}
                    {next && <Link href={next}>Next page</Link>}
                </section>
                <aside className="min-w-0 space-y-4 rounded-lg border bg-card p-4 text-card-foreground sm:p-6">
                    <h2 className="text-xl font-semibold tracking-tight">Staff actions</h2>
                    <Collapsible>
                        <CollapsibleTrigger asChild>
                            <Button type="button" variant="outline" className="h-auto min-h-9 max-w-full whitespace-normal text-start">
                                Register a lecturer
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent forceMount className="space-y-3 pt-3 data-[state=closed]:hidden">
                            <RegisterLecturer departments={departments} />
                        </CollapsibleContent>
                    </Collapsible>
                    <Collapsible>
                        <CollapsibleTrigger asChild>
                            <Button type="button" variant="outline" className="h-auto min-h-9 max-w-full whitespace-normal text-start">
                                Change a teaching allocation
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent forceMount className="space-y-3 pt-3 data-[state=closed]:hidden">
                            <ChangeAllocation />
                        </CollapsibleContent>
                    </Collapsible>
                </aside>
            </div>
        </main>
    );
}
