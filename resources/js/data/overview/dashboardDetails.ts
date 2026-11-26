import { restoreDrillDate } from '@/data/registry/recoverySchedule';

export const institution = {
    session: '2025/2026',
    description: 'Delivery, compliance and service health across every faculty for the 2025/2026 first semester.',
    backup: `Last run 26 Nov 02:00, 41.2 GB written, verification passed. Restore drill due ${restoreDrillDate}.`,
    weakestCoverage: 'Faculty of Arts and Education trails the institution by 8 points, driven by Week 4-6 content in ENG210 and EDM505 still in draft.',
    examSubtitle: 'Objective bank coverage for the two upcoming examinations',
    exams: [
        { title: 'ACC302 mid-term', meta: '18 Nov 2026, 09:00 · 68 candidates', status: 'Scheduled' },
        { title: 'BSC205 mid-term', meta: '21 Nov 2026, 13:00 · 54 candidates', status: 'Scheduled' },
    ],
    bank: [
        { label: 'Objective', value: 118, color: '#10B981' },
        { label: 'Short answer', value: 42, color: '#33475F' },
        { label: 'Essay', value: 24, color: '#F59E0B' },
    ],
} as const;

export const teaching = {
    title: 'Good afternoon, Dr. Adeyemi',
    description: 'Review the four course allocations, upcoming classes and new submissions for this semester.',
    scores: [64, 61, 66, 63, 69, 68, 71, 70, 74, 72],
    performance: [
        { label: 'ACC302 submission rate', value: 75, color: '#10B981' },
        { label: 'ACC302 attendance', value: 92, color: '#3B82F6' },
        { label: 'ENG210 submission rate', value: 95, color: '#F59E0B' },
        { label: 'CHM401 submission rate', value: 88, color: '#10B981' },
    ],
} as const;

export const study = {
    title: 'Welcome back, Blessing',
    description: 'Check your four registered courses, upcoming dates and released results.',
    coursesSubtitle: 'Four registered courses this semester',
    lesson: {
        code: 'ACC302', progress: 46, title: 'Week 3 · Journals and ledgers',
        description: 'Chapter manuscript, worked example and the practice set. You have 22 minutes of study time left in this module.',
        summary: [
            { label: 'Lessons completed this week', value: '4', hint: '22 min studied' },
            { label: 'Next quiz', value: 'Friday', hint: '10 objective items' },
            { label: 'Feedback waiting', value: '1', hint: 'View returned work' },
        ],
    },
} as const;
