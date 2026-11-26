export interface Assignment {
    id: string; title: string; course: string; due: string; state: string;
    submissions: number; total: number; late: number; marked: number;
    settings?: Record<string, string>; instructions?: string; attachments?: string; shortTitle?: string; publishedScore?: number;
}
export interface Submission {
    id: string; student: string; matric: string; assignment: string; submitted: string; status: string;
    late: boolean; score: number | null; feedback?: string; marks?: number[]; file?: string; size?: string;
}
export interface MarkingGuide { scriptPreview: string; rubric: string[]; maximum: number[]; awarded: number[] }
export type Receipt = { number: string; file: string; size: string; time: string; note: string };
export type Feedback = { id: string; score: number; text: string };
