import * as initial from './institution';

export const academicSessions = initial.sessions.map((s) => ({
    ...s,
    startDate: `${s.id.slice(0, 4)}-09-08`,
    endDate: `${s.id.slice(5)}-07-31`,
    semester: 'First Semester',
}));
export const windows: Record<string, [string, string][]> = {
    '2025/2026': [
        ['First semester', '08 Sep 2025 - 20 Dec 2025'],
        ['Second semester', '13 Jan 2026 - 31 Jul 2026'],
    ],
};
export const healthScope: [string, string][] = [
    ['Levels defined', '100 to 500'],
    ['Semesters per session', '2'],
    ['Oversight scope rule', 'Dean = faculty, HoD = department'],
];
export const structureChecks = [
    { result: 'pass', title: 'All departments have an assigned head', detail: '7 of 7 departments covered' },
    {
        result: 'watch',
        title: '2 programmes lack an approved curriculum',
        detail: 'ECN104 and BSC205 need a signed version',
    },
];
