type NamedRecord = { id: string; code: string; name: string; revision: string };
type Level = { id: string; code: string; label: string; position: number; academic_programme_id: string; revision: string };
type Specialization = NamedRecord & { department_id: string };
type Pathway = { id: string; specialization_id: string; academic_programme_id: string };

type EditableRecords = {
    'shared-programmes': NamedRecord;
    'programme-levels': Level;
    specializations: Specialization;
};

export type RegisterSelection = {
    [Kind in keyof EditableRecords]: { kind: Kind; record?: EditableRecords[Kind] };
}[keyof EditableRecords] | { kind: 'pathways'; record?: never };

export type RegisterRecords = {
    programmes: NamedRecord[];
    levels: Level[];
    specializations: Specialization[];
    pathways: Pathway[];
    actions: Record<RegisterSelection['kind'], string>;
};
