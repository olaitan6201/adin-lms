import { Action } from '@/components/ui/controls/Action';
import { Records } from '@/components/registry/Records';
import type { Selection, StructureProps } from './liveRecords';

export function LiveRegisters({ records, edit }: {
    records: Pick<StructureProps, 'programmes' | 'departments' | 'sessions' | 'semesters'>;
    edit: (selection: Selection) => void;
}) {
    const departments = new Map(records.departments.map(({ id, name }) => [id, name]));
    const sessions = new Map(records.sessions.map(({ id, label }) => [id, label]));

    return (
        <>
            <Records
                title="Legacy programme register"
                subtitle="Department-owned programmes still used by existing roster and curriculum workflows"
                columns={['Code', 'Programme', 'Department', 'Actions']}
                keyboardScroll
                rowKeys={records.programmes.map(({ id }) => id)}
                actions={
                    <Action icon="plus" onClick={() => edit({ kind: 'programmes' })} disabled={!departments.size}>
                        Add legacy programme
                    </Action>
                }
                rows={records.programmes.map(programme => [
                    programme.code,
                    programme.name,
                    departments.get(programme.department_id),
                    <Action key="manage" size="sm" onClick={() => edit({ kind: 'programmes', record: programme })}>
                        Manage
                    </Action>,
                ])}
            />
            {!departments.size && <p className="text-sm text-ink-600">Add a department before creating a programme.</p>}
            <Records
                title="Academic sessions and semesters"
                subtitle="Session windows drive roster scope, course delivery and reporting periods"
                columns={['Session', 'Window', 'Semesters', 'Actions']}
                keyboardScroll
                rowKeys={records.sessions.map(({ id }) => id)}
                actions={<Action icon="plus" onClick={() => edit({ kind: 'sessions' })}>Add session</Action>}
                rows={records.sessions.map(session => [
                    session.label,
                    `${session.starts_on} to ${session.ends_on}`,
                    records.semesters.filter(semester => semester.session_id === session.id)
                        .map(semester => `Semester ${semester.position}`).join(', ') || 'None recorded',
                    <Action key="manage" size="sm" onClick={() => edit({ kind: 'sessions', record: session })}>
                        Manage
                    </Action>,
                ])}
            />
            <Records
                title="Semester windows"
                columns={['Session', 'Semester', 'Window', 'Actions']}
                keyboardScroll
                rowKeys={records.semesters.map(({ id }) => id)}
                actions={
                    <Action icon="plus" onClick={() => edit({ kind: 'semesters' })} disabled={!sessions.size}>
                        Add semester
                    </Action>
                }
                rows={records.semesters.map(semester => [
                    sessions.get(semester.session_id),
                    `Semester ${semester.position}`,
                    `${semester.starts_on} to ${semester.ends_on}`,
                    <Action key="manage" size="sm" onClick={() => edit({ kind: 'semesters', record: semester })}>
                        Manage
                    </Action>,
                ])}
            />
        </>
    );
}
