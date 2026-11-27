import { RecordField } from '@/components/academics/RecordField';
import { field, type Field } from '@/components/academics/RecordForm';
import { FormFeedback } from '@/components/forms/FormFeedback';
import type { Department } from './liveRecords';
import type { RegisterRecords, RegisterSelection } from './registerRecords';

function registerFields(selection: RegisterSelection, records: RegisterRecords, departments: Department[]): Field[] {
    const programmeOptions = records.programmes.map(record => ({ id: record.id, name: `${record.name} (${record.code})` }));
    const programme = field('academic_programme_id', 'Shared programme', programmeOptions);
    const code = field('code', 'Code');

    switch (selection.kind) {
        case 'shared-programmes':
            return [code, field('name', 'Programme name')];
        case 'programme-levels':
            return [
                programme,
                code,
                field('label', 'Level label'),
                { name: 'position', label: 'Display order', type: 'number' },
            ];
        case 'specializations': {
            const options = departments.map(record => ({ id: record.id, name: `${record.name} (${record.code})` }));

            return [field('department_id', 'Department', options), code, field('name', 'Specialization name')];
        }
        case 'pathways': {
            const departmentCodes = new Map(departments.map(department => [department.id, department.code]));
            const tracks = records.specializations.map(track => ({
                id: track.id,
                name: `${track.name} (${track.code}) — ${departmentCodes.get(track.department_id) ?? 'Department unavailable'}`,
            }));

            return [field('specialization_id', 'Specialization', tracks), programme];
        }
    }
}

type AcademicRegisterFieldsProps = {
    selection: RegisterSelection;
    records: RegisterRecords;
    departments: Department[];
    errors: Record<string, string>;
    disabled: boolean;
};

export function AcademicRegisterFields({ selection, records, departments, errors, disabled }: AcademicRegisterFieldsProps) {
    const { record } = selection;
    const values: Record<string, unknown> = { ...record };
    const fields = registerFields(selection, records, departments);

    return (
        <FormFeedback errors={errors}>
            {record && <input type="hidden" name="revision" value={record.revision} />}
            <fieldset disabled={disabled} className="min-w-0 space-y-5">
                {fields.map(item => {
                    const current = String(values[item.name] ?? '');
                    if (record && item.options) {
                        return (
                            <div key={item.name} className="wrap-anywhere">
                                <p className="font-medium">{item.label}</p>
                                <p>{item.options.find(option => option.id === current)?.name}</p>
                                <input type="hidden" name={item.name} value={current} />
                            </div>
                        );
                    }

                    return (
                        <RecordField
                            key={item.name}
                            field={{ ...item, initial: current }}
                            error={errors[item.name]}
                        />
                    );
                })}
            </fieldset>
        </FormFeedback>
    );
}
