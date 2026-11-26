export interface Assignment {
    id: string;
    title: string;
    course: string;
    due: string;
    state: string;
    submissions: number;
    total: number;
    late: number;
    marked: number;
    settings?: Record<string, string>;
    instructions?: string;
    attachments?: string;
    shortTitle?: string;
}

export interface Submission {
    id: string;
    student: string;
    matric: string;
    assignmentId: string;
    submitted: string;
    status: string;
    late: boolean;
    score: number | null;
    feedback?: string;
    marks?: number[];
    file?: string;
    size?: string;
}

export interface MarkingGuide {
    scriptPreview: string;
    rubric: string[];
    maximum: number[];
}

export type AssignmentDraft = Pick<Assignment, 'title' | 'course' | 'due' | 'settings' | 'instructions' | 'attachments'>;

export type Receipt = {
    number: string;
    file: string;
    size: string;
    time: string;
    note: string;
};

export type Feedback = {
    excerpt: string;
    score: number;
    text: string;
};

export interface StudentRevision {
    receipt: Receipt;
    feedback?: Feedback;
}

export interface StudentWork {
    assignment: WindowedAssignment;
    current?: StudentRevision;
    previous: StudentRevision[];
}

export interface WindowedAssignment extends Assignment {
    opensAt: number;
    closesAt: number;
}
