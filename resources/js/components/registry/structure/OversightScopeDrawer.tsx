import { Drawer } from '@/components/ui/overlays/DialogDrawer';
import type { Department, Faculty } from './liveRecords';

export function OversightScopeDrawer({ faculty, departments, close }: {
    faculty: Faculty;
    departments: Department[];
    close: () => void;
}) {
    return (
        <Drawer title="Oversight scope" subtitle={faculty.name} close={close}>
            <section className="wrap-anywhere">
                <h3 className="font-semibold text-ink-900">Faculty oversight</h3>
                <p className="mt-1 text-ink-700">
                    {faculty.dean_names.length
                        ? `Active ${faculty.dean_names.length === 1 ? 'dean' : 'deans'}: ${faculty.dean_names.join(', ')}`
                        : 'No active dean assigned.'}
                </p>
            </section>
            <section>
                <h3 className="font-semibold text-ink-900">Departments in this faculty</h3>
                {departments.length === 0 ? (
                    <p className="mt-1 text-ink-700">No departments yet.</p>
                ) : (
                    <ul className="mt-2 divide-y divide-ink-100 rounded-lg border border-ink-100">
                        {departments.map(department => (
                            <li key={department.id} className="p-3 wrap-anywhere">
                                <p className="font-medium text-ink-900">{department.name}</p>
                                <p className="mt-1 text-ink-700">
                                    {department.hod_names.length
                                        ? `Active ${department.hod_names.length === 1 ? 'head' : 'heads'} of department: ${department.hod_names.join(', ')}`
                                        : 'No active head of department assigned.'}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </Drawer>
    );
}
