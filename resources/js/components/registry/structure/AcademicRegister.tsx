import { Records } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import type { Department } from './liveRecords';
import type { RegisterRecords, RegisterSelection } from './registerRecords';

export function AcademicRegister({ records, departments, edit }: {
    records: RegisterRecords;
    departments: Department[];
    edit: (selection: RegisterSelection) => void;
}) {
    const programmeNames = new Map(records.programmes.map(record => [record.id, `${record.name} (${record.code})`]));
    const departmentNames = new Map(departments.map(record => [record.id, `${record.name} (${record.code})`]));
    const specializations = new Map(records.specializations.map(record => [record.id, record]));

    function manage(selection: RegisterSelection, label: string) {
        return (
            <Action size="sm" aria-label={`Manage ${label}`} onClick={() => edit(selection)}>
                Manage
            </Action>
        );
    }

    return (
        <div className="structure-register space-y-5">
            <p className="text-sm text-ink-700 sm:hidden">Scroll register tables horizontally to see more columns.</p>
            <Records
                title="Shared programmes"
                subtitle="Programmes are institution-wide. Configure the specializations that offer them in Academic pathways."
                columns={['Code', 'Programme', 'Actions']}
                tableClass="structure-register-table"
                keyboardScroll
                rowKeys={records.programmes.map(programme => programme.id)}
                actions={<Action icon="plus" onClick={() => edit({ kind: 'shared-programmes' })}>Add shared programme</Action>}
                rows={records.programmes.map(programme => [
                    programme.code,
                    programme.name,
                    manage({ kind: 'shared-programmes', record: programme }, `shared programme ${programmeNames.get(programme.id)}`),
                ])}
            />
            <Records
                title="Programme levels"
                subtitle={programmeNames.size ? 'Each level belongs to one programme.' : 'Add a shared programme before configuring its levels.'}
                columns={['Programme', 'Code', 'Level', 'Order', 'Actions']}
                tableClass="structure-register-table"
                keyboardScroll
                rowKeys={records.levels.map(level => level.id)}
                actions={
                    <Action
                        icon="plus"
                        disabled={!programmeNames.size}
                        onClick={() => edit({ kind: 'programme-levels' })}
                    >
                        Add programme level
                    </Action>
                }
                rows={records.levels.map(level => [
                    programmeNames.get(level.academic_programme_id),
                    level.code,
                    level.label,
                    level.position,
                    manage(
                        { kind: 'programme-levels', record: level },
                        `${level.label} (${level.code}) in ${programmeNames.get(level.academic_programme_id) ?? 'Programme unavailable'}`,
                    ),
                ])}
            />
            <Records
                title="Specializations"
                subtitle={departmentNames.size ? 'Departments own their specializations.' : 'Add a department before configuring its specializations.'}
                columns={['Department', 'Code', 'Specialization', 'Actions']}
                tableClass="structure-register-table"
                keyboardScroll
                rowKeys={records.specializations.map(track => track.id)}
                actions={
                    <Action
                        icon="plus"
                        disabled={!departmentNames.size}
                        onClick={() => edit({ kind: 'specializations' })}
                    >
                        Add specialization
                    </Action>
                }
                rows={records.specializations.map(track => [
                    departmentNames.get(track.department_id),
                    track.code,
                    track.name,
                    manage(
                        { kind: 'specializations', record: track },
                        `${track.name} (${track.code}) in ${departmentNames.get(track.department_id) ?? 'Department unavailable'}`,
                    ),
                ])}
            />
            <Records
                title="Academic pathways"
                subtitle={programmeNames.size && specializations.size
                    ? 'A pathway makes a specialization available within a shared programme.'
                    : 'Add a shared programme and a specialization before configuring a pathway.'}
                columns={['Department', 'Specialization', 'Programme']}
                tableClass="structure-register-table"
                keyboardScroll
                rowKeys={records.pathways.map(pathway => pathway.id)}
                actions={
                    <Action
                        icon="plus"
                        disabled={!programmeNames.size || !specializations.size}
                        onClick={() => edit({ kind: 'pathways' })}
                    >
                        Add pathway
                    </Action>
                }
                rows={records.pathways.map(pathway => {
                    const track = specializations.get(pathway.specialization_id);

                    return [
                        track && departmentNames.get(track.department_id),
                        track && `${track.name} (${track.code})`,
                        programmeNames.get(pathway.academic_programme_id),
                    ];
                })}
            />
        </div>
    );
}
