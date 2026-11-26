import { type Desk, Field, exportRecords } from '@/components/registry/Desk';
import { Records, status, cap, val } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import { Icon } from '@/components/icons/Icon';
import { Person } from './Person';
import type { StaffRecord } from '@/types/registry/people';

export function StaffRegister({
    visible,
    editStaff,
    query,
    search,
    filter,
    setFilter,
    desk,
}: {
    visible: StaffRecord[];
    editStaff: (staff?: StaffRecord) => void;
    query: string;
    search: (value: string) => void;
    filter: string;
    setFilter: (filter: string) => void;
    desk: Desk;
}) {
    function openFilters() {
        desk.show({
            title: 'Filters',
            body: <Field label="Status" value={filter} options={['All statuses', 'active', 'suspended']} />,
            submit: 'Apply filters',
            save: (d) => setFilter(val(d, 'Status')),
        });
    }

    return (
        <Records
            tableClass="[&_th:last-child]:w-[100px] [&_td:last-child]:text-right"
            title="Staff and administrators"
            subtitle="Roles that carry oversight, academic or technical authority"
            actions={
                <>
                    {status(`${visible.length} shown`)}
                    <Action
                        variant="primary"
                        size="sm"
                        icon="userPlus"
                        onClick={() => editStaff()}
                    >
                        Invite user
                    </Action>
                </>
            }
            columns={['Person', 'Role', 'Unit', 'MFA', 'Last active', 'Status', '']}
            rows={visible.map((member) => [
                <Person key="staff" name={member.name} id={member.id.toUpperCase()} />,
                status(member.role, member.role === 'Super Admin' ? 'emerald' : 'slate'),
                <span key="unit" className="text-[13px] text-ink-600">
                    {member.unit}
                </span>,
                status(member.mfa ? 'Enrolled' : 'Not enrolled', member.mfa ? 'emerald' : 'amber'),
                <span key="activity" className="text-[13px] text-ink-500">
                    {member.lastActive}
                </span>,
                status(cap(member.status)),
                <Action key="details" size="sm" onClick={() => editStaff(member)}>
                    Details
                </Action>,
            ])}
        >
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                    <Icon
                        name="search"
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400"
                    />
                    <input
                        className="input pl-9"
                        aria-label="Search staff"
                        value={query}
                        onChange={(e) => search(e.target.value)}
                        placeholder="Search by name, staff ID or unit"
                    />
                </div>
                <Action size="sm" icon="filter" onClick={openFilters}>
                    Filters
                </Action>
                <Action size="sm" icon="download" onClick={() => exportRecords('staff', visible)}>
                    Export
                </Action>
            </div>
        </Records>
    );
}
