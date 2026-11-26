export type CourseDefinition = {
    code: string;
    title: string;
    type: string;
    prereq: string;
    department: string;
    state: string;
    description: string;
    units: number;
    level: number;
    semester: number;
};
export type ProgrammeVersion = {
    id: string;
    code: string;
    title: string;
    version: string;
    approved: string;
    revision: number;
    level: number;
    units: number;
};
export type CurriculumCatalogueInputs = {
    programmeOutcomes: string[];
    matrix: { outcome: string; weights: number[] }[];
    columns: string[];
    catalogueEntries: CourseDefinition[];
    programmeVersions: ProgrammeVersion[];
    prerequisite: { code: string; title: string };
    selectedCourse: { definition: { code: string } };
    accountingOutcomes: string[];
    programmes: { title: string }[];
};
