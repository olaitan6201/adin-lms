export type Faculty = {
    id: string;
    name: string;
    code: string;
    head: string;
    departments: {
        id: string;
        name: string;
        code: string;
        programmes: number;
        lecturers: number;
        students: number;
    }[];
};
export type Programme = {
    id: string;
    code: string;
    title: string;
    faculty: string;
    department: string;
    level: number;
    units: number;
};
export type AcademicSession = {
    id: string;
    label: string;
    state: string;
    start: string;
    end: string;
    startDate: string;
    endDate: string;
    semester: string;
};
export type AcademicStructureInputs = {
    initialFaculties: Faculty[];
    initialProgrammes: Programme[];
    academicSessions: AcademicSession[];
    windows: Record<string, [string, string][]>;
    healthScope: [string, string][];
    structureChecks: { result: string; title: string; detail: string }[];
};
