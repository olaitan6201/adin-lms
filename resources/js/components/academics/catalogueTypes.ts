import type { Choice } from './RecordForm';
import type { CurriculumStatus } from './workflow';

type Version = {
    id: string;
    version: number;
    status: CurriculumStatus;
    framework_revision: string | null;
    approved_at: string | null;
    approved_by: string | null;
};

export type Entry = {
    id: string;
    course_id: string;
    code: string;
    title: string;
    credits: string;
    outline: string;
    compulsory: boolean;
    description: string;
    semester_position: number;
    level_id: string;
};

export type Outcome = {
    id: string;
    statement: string;
    curriculum_course_id?: string;
};

export type CatalogueProps = {
    edit: boolean;
    approve: boolean;
    versions: (Pick<Version, 'id' | 'version' | 'status'> & Choice)[];
    version: Version | null;
    entries: Entry[];
    levels: Choice[];
    programmes: Choice[];
    courseOutcomes: Outcome[];
    programmeOutcomes: Outcome[];
    mappings: {
        course_outcome_id: string;
        programme_outcome_id: string;
    }[];
    prerequisites: {
        curriculum_course_id: string;
        required_course_id: string;
    }[];
};
