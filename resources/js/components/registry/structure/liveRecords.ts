type AcademicUnit = { id: string; code: string; name: string };

export type Faculty = AcademicUnit & { dean_names: string[] };
export type Department = AcademicUnit & {
    faculty_id: string;
    hod_names: string[];
    programme_count: number;
    active_lecturer_count: number;
    active_imported_student_count: number | null;
};
export type Programme = AcademicUnit & { department_id: string };
export type Session = { id: string; label: string; starts_on: string; ends_on: string };
export type Semester = Omit<Session, 'label'> & { position: number; session_id: string };

type Records = {
    faculties: Faculty[];
    departments: Department[];
    programmes: Programme[];
    levels: { id: string; label: string }[];
    sessions: Session[];
    semesters: Semester[];
};

export type StructureKind = keyof Records;
export type StructureProps = Records & {
    actions: Record<StructureKind, string>;
    import: Record<'template' | 'columns' | 'preview' | 'store', string>;
    student_count_session: Pick<Session, 'id' | 'label'> | null;
    health: {
        departments_with_active_hod: number;
        programmes_with_approved_curriculum: number;
    };
};

export type Selection = {
    [Kind in StructureKind]: { kind: Kind; record?: Records[Kind][number] };
}[StructureKind] | { kind: 'unit' };
