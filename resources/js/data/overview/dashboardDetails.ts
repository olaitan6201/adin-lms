export const teaching = {
    title: 'Good afternoon, Dr. Adeyemi',
    description: 'Three courses are running this semester. Two submissions arrived after the deadline and one is waiting for a second marker.',
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
    description: 'Four courses are running this semester. One assignment is due in two days and your ACC302 mid-term opens on 18 November.',
    coursesSubtitle: 'Four registered courses this semester',
    lesson: {
        code: 'ACC302', progress: 46, title: 'Week 3 · Journals and ledgers',
        description: 'Chapter manuscript, worked example and the practice set. You have 22 minutes of study time left in this module.',
        summary: [
            { label: 'Lessons completed this week', value: '4', hint: '22 min studied' },
            { label: 'Next quiz', value: 'Friday', hint: '10 objective items' },
            { label: 'Feedback waiting', value: '1', hint: 'Lab report, 74%' },
        ],
    },
} as const;
