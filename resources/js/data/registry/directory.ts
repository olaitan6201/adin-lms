import * as source from './people';

export const studentMetrics: [string, string, string?][] = [
    ['Last import', '26 Nov 2026, 16:20', '142 created, 3 rejected'],
    ['Pending activation', '41 students', 'Invitation not yet accepted'],
    ['Attendance alerts', '63 below 50%', 'HOD escalation recommended'],
];
export const staffDirectory = source.staff.map((s) => ({
    ...s,
    email: s.id === 'u-001' ? 'ifeoma@adin-u.com' : '',
    idle: '30 minutes',
}));
export const studentDirectory = source.students.map((s) => ({
    ...s,
    email: `${s.name.toLowerCase().replace(' ', '.')}@student.adin-u.com`,
}));
export const devices = [
    { id: 'desktop', title: 'Chrome on Windows', detail: '10.24.8.19 · active now', current: true },
    { id: 'mobile', title: 'Safari on iPhone', detail: '197.210.xx · 26 min ago', current: false },
];
export const learningHistory: [string, string][] = [
    ['2025/2026 · ACC302', '82%'],
    ['2025/2026 · ACC311', '74%'],
    ['2024/2025 · ACC201', '78%'],
];
export const directorySummary = {
    staff: 96,
    students: 1694,
    roles: 9,
    superAdminId: 'u-001',
    staffNumber: 'AOU/STA/0001',
    historyStudentId: 's-001',
};
