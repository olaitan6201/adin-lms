export type MetricBar = {
    label: string;
    value: number;
    color: string;
};
export type Exam = {
    title: string;
    meta: string;
    status: string;
};
export type Offering = {
    title: string;
    code: string;
    term: string;
    students: number;
    mode: string;
    completion: number;
};
export type Submission = {
    id: string;
    student: string;
    matric: string;
    assignment: string;
    submitted: string;
    late: boolean;
};
export type StudentCourse = {
    code: string;
    title: string;
    value: number;
    lessons: string;
};
export type PendingWork = {
    id: string;
    title: string;
    course: string;
    due: string;
    state: string;
    tone: string;
};
export type Result = {
    course: string;
    title: string;
    ca: number;
    mid: number;
    total: number;
    grade: string;
    state: string;
};
export type Notice = {
    id: string;
    title: string;
    meta: string;
    time: string;
};
export type Lesson = {
    code: string;
    progress: number;
    title: string;
    description: string;
    summary: readonly {
        label: string;
        value: string;
        hint: string;
    }[];
};
