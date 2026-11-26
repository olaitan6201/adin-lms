export interface Session {
    id: string; course: string; title: string; date: string; time: string; method: string; state: string;
    present: number; absent: number; late: number;
}
export interface Learner { name: string; matric: string; percent: number; mark: string }
export type AttendanceBand = readonly [label: string, count: number, color: string];
