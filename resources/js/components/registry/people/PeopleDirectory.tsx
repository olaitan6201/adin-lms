import { useState } from 'react';
import { useDesk, Register } from '@/components/registry/Desk';
import { Action } from '@/components/ui/controls/Action';
import { Sessions } from './Sessions';
import { useStaffDirectory } from './useStaffDirectory';
import { useStudentDirectory } from './useStudentDirectory';
import { StaffRegister } from './StaffRegister';
import { StudentRegister } from './StudentRegister';
import { RolePermissions } from './RolePermissions';
import type { PeopleDirectoryInputs } from '@/types/registry/people';

export function PeopleDirectory({
    staffDirectory,
    studentDirectory,
    devices,
    learningHistory,
    studentMetrics,
    directorySummary,
    roleMatrix,
    permissionMatrix,
}: PeopleDirectoryInputs) {
    const desk = useDesk();
    const [tab, setTab] = useState(0);
    const { visible, query, search, filter, setFilter, editStaff } = useStaffDirectory({
        staffDirectory,
        directorySummary,
        devices,
        roleMatrix,
        desk,
    });
    const { students, editStudent } = useStudentDirectory({
        studentDirectory,
        directorySummary,
        learningHistory,
        desk,
    });

    function monitorSessions() {
        desk.show({ title: 'Session monitor', body: <Sessions devices={devices} /> });
    }

    return (
        <Register
            eyebrow="Identity and authority"
            title="People and roles"
            description="Staff, student profiles and the permissions that decide who can see and change what."
            overlay={desk.overlay}
            actions={
                <>
                    <Action icon="lock" onClick={monitorSessions}>
                        Session monitor
                    </Action>
                    <Action icon="userPlus" variant="primary" onClick={() => editStaff()}>
                        Add person
                    </Action>
                </>
            }
            tabs={[
                ['Staff and administrators', directorySummary.staff],
                ['Students', directorySummary.students],
                ['Roles and permissions', directorySummary.roles],
            ]}
            active={tab}
            select={setTab}
        >
            {tab === 0 && <StaffRegister {...{ visible, editStaff, query, search, filter, setFilter, desk }} />}
            {tab === 1 && (
                <StudentRegister {...{ students, editStudent, directorySummary, studentMetrics, desk }} />
            )}
            {tab === 2 && <RolePermissions {...{ roleMatrix, permissionMatrix }} />}
        </Register>
    );
}
