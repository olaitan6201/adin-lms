import type { Choice } from './RecordForm';

export type AcademicStatus = 'draft' | 'reviewed' | 'approved';

export type CourseRevision = {
    id: string;
    title: string;
    description: string | null;
    syllabus: string | null;
    learning_outcomes: string | null;
    standard_units: string | number;
    revision_number: number;
    status: AcademicStatus;
};

type Course = Choice & { revisions: CourseRevision[] };

export type CurriculumEntry = {
    id: string;
    course_id: string;
    course_revision_id: string;
    programme_level_id: string;
    code: string;
    title: string;
    level: string;
    credits: string | number;
    semester_position: number;
    category: 'core' | 'elective' | 'general_studies' | null;
    requirement_mode: 'individual' | 'choice' | null;
};

export type Adoption = {
    id: string;
    version: string | number;
    session: string;
    cohort: string;
    decision_reference: string;
    reason: string;
    active: boolean;
};

export type Curriculum = Choice & {
    status: AcademicStatus;
    framework_revision: string;
    history: { sourceVersion: number; sourceUrl: string; changes: { id: string; description: string }[] } | null;
    levels: Choice[];
    revisions: (Choice & { course_id: string })[];
    entries: CurriculumEntry[];
    choices: {
        id: string;
        code: string;
        minimum_selections: number;
        maximum_selections: number;
        unresolvedOptions: number;
        options: string[];
    }[];
    courseOutcomes: Choice[];
    programmeOutcomes: Choice[];
    prerequisites: { for: string; requires: string }[];
    mappings: { course: string; programme: string }[];
    adoptions: Adoption[];
};

type RevisionActions = { review: string; approve: string; update: string };
type Actions = {
    courseStore: string;
    revisionStore: string | null;
    revisions: Record<string, RevisionActions>;
    curriculumStore: string;
    assignment: string | null;
    assignmentUpdates: Record<string, string>;
    choice: string | null;
    prerequisite: string | null;
    courseOutcome: string | null;
    programmeOutcome: string | null;
    mapping: string | null;
    review: string | null;
    approve: string | null;
    fork: string | null;
    cohort: string;
    adoption: string;
};

export type AcademicCoreProps = {
    edit: boolean;
    approve: boolean;
    links: { workspace: string; structure: string | null; legacyCatalogue: string };
    departments: Choice[];
    courses: Choice[];
    pathways: Choice[];
    sessions: Choice[];
    cohorts: Choice[];
    course: Course | null;
    curricula: Choice[];
    curriculum: Curriculum | null;
    actions: Actions;
};

export const statusLabel = {
    draft: 'Draft',
    reviewed: 'Reviewed',
    approved: 'Approved',
};

export const categoryLabel = {
    core: 'Core',
    elective: 'Elective',
    general_studies: 'General studies',
};

export const requirementLabel = {
    individual: 'Individual',
    choice: 'Choice group',
};
