import { StaffIdentity } from './StaffIdentity';
import { useState } from 'react';
import type { Desk } from '@/components/registry/Desk';
import { val } from '@/components/registry/Records';
import { Avatar } from './Person';
import type { StaffRecord, RoleEntry, DirectorySummary } from '@/types/registry/people';

export function useStaffDirectory({
    staffDirectory,
    directorySummary,
    devices,
    roleMatrix,
    desk,
}: {
    staffDirectory: StaffRecord[];
    directorySummary: DirectorySummary;
    devices: string[][];
    roleMatrix: RoleEntry[];
    desk: Desk;
}) {
    const [staff, setStaff] = useState(staffDirectory);
    const [query, search] = useState('');
    const [filter, setFilter] = useState('All statuses');
    const visible = staff.filter(
        (member) =>
            (filter === 'All statuses' || member.status === filter) &&
            [member.name, member.id, member.unit].join(' ').toLowerCase().includes(query.toLowerCase()),
    );

    function saveStaff(data: FormData, member?: StaffRecord) {
        const changes = { email: val(data, 'Email'), role: val(data, 'Role'), idle: val(data, 'Idle logout') };
        if (member) {
            setStaff((records) =>
                records.map((record) => (record.id === member.id ? { ...record, ...changes } : record)),
            );
            return;
        }
        const person = {
            ...changes,
            name: val(data, 'Name'),
            unit: val(data, 'Unit'),
            mfa: false,
            lastActive: 'Never',
            status: 'active',
        };
        setStaff((records) => [...records, { ...person, id: `u-${records.length + 1}` }]);
    }
    function editStaff(member?: StaffRecord) {
        desk.show({
            title: member?.name ?? 'Add person',
            portrait: member && <Avatar name={member.name} large />,
            subtitle: member ? `${member.role} · ${member.unit}` : undefined,
            submit: 'Save changes',
            message: 'User record updated',
            body: <StaffIdentity {...{ member, directorySummary, devices, roleMatrix }} />,
            save: (data) => saveStaff(data, member),
        });
    }
    return { visible, query, search, filter, setFilter, editStaff };
}
