import { type CriterionScore } from '@/components/assessments/assignments/CriterionFeedback';

export type SubmissionRow = {
    recipients: string[];
    id: string;
    revision: number;
    body: string | null;
    receipt: string;
    late: boolean;
    files: string[];
    scores: {
        id: string;
        points: string;
        feedback: string | null;
        marked_file_id: string | null;
        revision: number;
        released_at: string | null;
        criteria: CriterionScore[];
    }[];
};
export type AssignmentDetail = {
    id: string;
    instructions: string;
    group_work: boolean;
    opens_at: string;
    due_at: string;
    closes_at: string;
    accepted_formats: string[];
    max_bytes: number;
    editable: boolean;
    late_policy: { allow: boolean };
};
