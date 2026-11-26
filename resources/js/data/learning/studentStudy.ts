export const studyCourse = {
    week: 'ACC302 · Week 3',
    title: 'Intermediate Financial Accounting',
    summary: 'Blended delivery · Dr. Peter Adeyemi · 46% of the course completed',
    completion: 46,
    submissionRate: 75,
    attendance: 92,
    lessons: '5 of 12 lessons',
};

export const registration = {
    courses: [
        {
            code: 'ACC302',
            title: 'Intermediate Financial Accounting',
            lecturer: 'Dr. Peter Adeyemi',
            value: 46,
            lessons: '3 / 12',
            mode: 'Blended',
            next: 'Practice set 3.1',
        },
        {
            code: 'BSC205',
            title: 'Cell and Molecular Biology',
            lecturer: 'Dr. Amaka Eze',
            value: 61,
            lessons: '5 / 9',
            mode: 'Online',
            next: 'Lab report submission',
        },
        {
            code: 'ENG210',
            title: 'Literary Devices and Criticism',
            lecturer: 'Dr. Halima Yusuf',
            value: 38,
            lessons: '2 / 11',
            mode: 'Face-to-face',
            next: 'Group presentation prep',
        },
        {
            code: 'MTH112',
            title: 'Calculus I',
            lecturer: 'Dr. Uche Okonkwo',
            value: 54,
            lessons: '6 / 12',
            mode: 'Online',
            next: 'Revision quiz 3',
        },
    ],
    summary: 'Four registered courses for the 2025/2026 first semester, 12 units in total.',
    checklist: 'ACC302 · what is still to be done in this course',
    lockedLabel: 'Opens 18 Nov',
};
