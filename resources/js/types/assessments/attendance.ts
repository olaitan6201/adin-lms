export interface Session {
    id: string;
    course: string;
    title: string;
    date: string;
    time: string;
    method: string;
    state: string;
    present: number;
    absent: number;
    late: number;
}
export const registerStatuses = ['present', 'late', 'absent', 'excused'] as const;

export type RegisterStatus = typeof registerStatuses[number];

export type RegisterMark = RegisterStatus | '';

export interface Learner {
    name: string;
    matric: string;
    percent: number;
    mark: RegisterMark;
}

export type AttendanceBand = {
    label: string;
    count: number;
    color: string;
    upperExclusive: number | null;
};
