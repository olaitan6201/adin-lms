import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { ChangeAllocation, RegisterLecturer, type DepartmentOption } from '@/components/staff/StaffForms';
import { DeskHeading } from '@/components/academics/DeskHeading';
import { RegistryPanel, RegistryTable } from '@/components/academics/RegistryPanel';
import { LecturerRow, type Staff } from '@/components/staff/LecturerRow';

type Props = {
    staff: Staff[];
    departments: DepartmentOption[];
    previous: string | null;
    next: string | null;
};

export default function StaffDirectory({ staff, departments, previous, next }: Props) {
    return (
        <main className="w-full min-w-0 space-y-5 wrap-anywhere">
            <Head title="Lecturer directory" />
            <Link href="/courses" className="text-primary underline underline-offset-4">
                My courses
            </Link>
            <DeskHeading area="People and roles" title="Lecturer directory">
                Review teaching records, update departments and manage class allocations.
            </DeskHeading>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <RegistryPanel title="Registered staff" subtitle="Lecturers, departments and allocations">
                    {staff.length ? (
                        <RegistryTable title="Registered staff records" columns={['Lecturer', 'Department', 'Actions']}>
                            {staff.map((s) => (
                                <LecturerRow key={s.staff_number} lecturer={s} departments={departments} />
                            ))}
                        </RegistryTable>
                    ) : (
                        <p>No lecturer profiles yet.</p>
                    )}
                    {previous && <Link href={previous}>Previous page</Link>} {next && <Link href={next}>Next page</Link>}
                </RegistryPanel>
                <RegistryPanel title="Staff actions">
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
                </RegistryPanel>
            </div>
        </main>
    );
}
