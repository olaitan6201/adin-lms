import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import RecordForm, { field } from '@/components/academics/RecordForm';
import { type DepartmentOption } from '@/components/staff/StaffForms';

export type Staff = {
    id: string;
    staff_number: string;
    full_name: string;
    department: string;
    offerings: string[];
};

export function LecturerRow({ lecturer, departments }: {
    lecturer: Staff;
    departments: DepartmentOption[]
}) {
    return (
        <tr>
            <td>
                <strong>{lecturer.full_name}</strong>
                <div className="font-mono text-xs text-ink-500">{lecturer.staff_number}</div>
            </td>
            <td>{lecturer.department}</td>
            <td className="space-y-2">
                <p>
                    <Link href={`/staff/${lecturer.id}/activity`} className="text-primary underline underline-offset-4">
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
                            action={`/staff/${lecturer.id}/department`}
                            fields={[field('department_id', 'New department', departments)]}
                        />
                    </CollapsibleContent>
                </Collapsible>
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <Button type="button" variant="outline" className="h-auto min-h-9 max-w-full whitespace-normal text-start">
                            Teaching allocations ({lecturer.offerings.length})
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent forceMount className="space-y-3 pt-3 data-[state=closed]:hidden">
                        {lecturer.offerings.length ? (
                            <ul className="list-inside list-disc">
                                {lecturer.offerings.map((id) => (
                                    <li key={id}>{id}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No teaching allocations.</p>
                        )}
                    </CollapsibleContent>
                </Collapsible>
            </td>
        </tr>
    );
}
