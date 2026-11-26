export const guardian = {
    student: {
        name: 'Blessing Okonkwo',
        matric: 'AOU/2023/0412',
        programme: 'B.Sc. Accounting and Finance',
        level: 300,
    },
    timeline: [
        { title: 'Linked to this guardian account', meta: '08 Sep 2026', body: 'Registrar, on the guardian consent form' },
        { title: 'Scope of consent', meta: 'Reviewed each semester', body: 'Progress only, until 30 Jun 2027' },
        {
            title: 'Consent expires',
            meta: '30 Jun 2027',
            body: 'Access ends automatically unless the Registrar renews the consent.',
        },
    ],
    initials: 'BO',
    consentState: 'Consent active',
    sharedMaterialIds: ['week-3-manuscript', 'practice-set', 'trial-balance'],
};

export const progress = {
    attendance: [
        {
            course: 'ACC302',
            label: 'Intermediate Financial Accounting',
            value: 92,
            tone: 'emerald',
        },
        {
            course: 'BSC205',
            label: 'Cell and Molecular Biology',
            value: 96,
            tone: 'emerald',
        },
        {
            course: 'ENG210',
            label: 'Literary Devices and Criticism',
            value: 78,
            tone: 'amber',
        },
        {
            course: 'MTH112',
            label: 'Calculus I',
            value: 88,
            tone: 'emerald',
        },
    ],
    deadlines: [
        {
            item: 'Case analysis: IFRS 15 revenue recognition',
            course: 'ACC302',
            due: '28 Nov 2026, 23:59',
            state: 'Open',
        },
        {
            item: 'Tutorial: consolidation of accounts',
            course: 'ACC302',
            due: '16 Nov 2026, 16:00',
            state: 'Attended',
        },
        {
            item: 'ACC302 mid-term examination',
            course: 'ACC302',
            due: '18 Nov 2026, 09:00',
            state: 'Completed',
        },
    ],
};

export const withheld = [
    'Scores still in moderation or awaiting approval',
    'Submissions that have not yet been marked',
    'Examination papers, questions and invigilation records',
    'Messages and forum posts that are not announcements',
    'Results for any other student, and any other guardian',
    'Lecturer notes, rubrics and internal review comments',
];
