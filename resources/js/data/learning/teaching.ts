export const health = {
    tiles: [
        {
            label: 'Enrolled students',
            value: '68',
        },
        {
            label: 'Published modules',
            value: '5 of 7',
        },
        {
            label: 'Resources',
            value: '9',
        },
        {
            label: 'Assignments',
            value: '2',
        },
    ],
    attention: [
        {
            icon: 'alert',
            tab: 'content',
            tone: 'text-amber-600',
            title: 'Week 6 and Week 7 modules are still in draft',
            meta: '14 students have reached Week 6',
        },
        {
            icon: 'clipboard',
            tab: 'assignments',
            tone: 'text-amber-600',
            title: '34 submissions are waiting for a score',
            meta: 'Oldest received 12 Nov 2026',
        },
        {
            icon: 'users',
            tab: 'attendance',
            tone: 'text-rose-600',
            title: '5 students are below 60% attendance',
            meta: 'Head of department has been notified',
        },
    ],
    rosterLabel: '68 registered students',
    classmates: [
        { name: 'Blessing Okonkwo', attendance: 92, needsAttention: false },
        { name: 'Chinedu Okafor', attendance: 78, needsAttention: false },
        { name: 'Aisha Bello', attendance: 96, needsAttention: false },
        { name: 'Emeka Uzoma', attendance: 64, needsAttention: true },
        { name: 'Oluwaseun Ajayi', attendance: 88, needsAttention: false },
    ],
    completion: 46,
    submissions: 75,
    attendanceRate: 92,
};

export const teachingCourse = {
    term: 'ACC302 · 2025/2026 first semester',
    title: 'Intermediate Financial Accounting',
    summary: 'Blended delivery · 68 students · Blended · 5 of 7 modules published',
    modules: 7,
    resources: 7,
    assignments: 2,
};

export const allocation = {
    term: '2025/2026 first semester',
    courseCount: '4 courses',
    studentCount: '245 students',
    workload: [
        {
            label: 'Scheduled classes',
            value: '24 hours',
        },
        {
            label: 'Assignments to mark',
            value: '112 scripts',
        },
        {
            label: 'Examination sittings',
            value: '2',
        },
        {
            label: 'Students supervised',
            value: '245',
        },
    ],
    preparation: [
        {
            title: 'Week 6 module',
            state: 'Draft',
            tone: 'amber',
        },
        {
            title: 'Practice set uploaded',
            state: 'Ready',
            tone: 'emerald',
        },
        {
            title: 'Mid-term blueprint approved',
            state: 'Ready',
            tone: 'emerald',
        },
        {
            title: 'Recording of 12 Nov class',
            state: 'Processing',
            tone: 'sky',
        },
    ],
    bands: [
        {
            label: 'Strong (80%+)',
            value: 41,
            color: '#10B981',
        },
        {
            label: 'Steady (60-79%)',
            value: 19,
            color: '#3B82F6',
        },
        {
            label: 'At risk (<50%)',
            value: 8,
            color: '#F43F5E',
        },
    ],
    cohortSize: 68,
};

export const chapterOutline = [
    'Objectives',
    'Explanation',
    'Illustrations',
    'Worked examples',
    'Practical examples',
    'Exercises',
    'Revision questions',
    'Activities and quizzes',
    'Summary',
    'References and reading list',
];
