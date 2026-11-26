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
export type CurriculumRevision = {
    number: number;
    state: 'approved' | 'draft' | 'awaiting approval';
    approved: string | null;
    outcomes: string[];
    mapping?: { columns: string[]; matrix: { outcome: string; weights: number[] }[] };
};
export type ProgrammeVersion = {
    id: string;
    code: string;
    title: string;
    revisions: CurriculumRevision[];
    level: number;
    units: number;
};
export type CurriculumCatalogueInputs = {
    catalogueEntries: CourseDefinition[];
    programmeVersions: ProgrammeVersion[];
    prerequisite: { code: string; title: string };
    selectedCourse: { definition: { code: string } };
    accountingOutcomes: string[];
};
