export const room = {
    title: 'Tutorial: consolidation of accounts',
    elapsed: '00:42:18',
    presenter: 'Dr. Peter Adeyemi is presenting',
    slide: 'Slide 14 of 38 · consolidation of subsidiary books',
    dividendQuestion: 'How do we treat the intercompany dividend?',
    eliminationQuestion: 'Is the elimination entry the same for both years?',
    joined: '47',
    enrolled: 'of 68 enrolled joined',
};

export const archive = {
    recordings: [
        {
            id: 'chm-titration',
            transcript: null,
            modules: [
                { id: 'CHM401-1', title: 'Practical preparation' },
                { id: 'CHM401-2', title: 'Titration' },
            ],
            title: 'Practical briefing: titration',
            course: 'CHM401',
            date: '12 Nov 2026',
            length: '1:58:22',
            views: 38,
        },
        {
            id: 'acc-journal',
            transcript: '00:12 Lecturer: Start with the cash sale in the journal. Record a debit to cash and a credit to sales. At the end of the day, post each amount to the corresponding ledger account.',
            modules: [
                { id: 'ACC302-1', title: 'The accounting equation' },
                { id: 'ACC302-2', title: 'Journals and ledgers' },
            ],
            title: 'Tutorial: journal entries and ledgers',
            course: 'ACC302',
            date: '05 Nov 2026',
            length: '1:12:05',
            views: 61,
        },
        {
            id: 'eng-narrator',
            transcript: '00:18 Lecturer: The narrator can describe a scene without knowing what every character thinks. Underline a sentence where the narrator makes an inference, then rewrite it from the other character’s perspective.',
            modules: [
                { id: 'ENG210-1', title: 'Narrative perspective' },
                { id: 'ENG210-2', title: 'Group presentation' },
            ],
            title: 'Workshop: narrative voice',
            course: 'ENG210',
            date: '29 Oct 2026',
            length: '1:44:37',
            views: 74,
        },
    ],
};

const tutorialDetails = {
    date: '2026-11-26',
    start: '16:00',
    meetingLink: 'Issued to enrolled students 15 minutes before start',
    checkin: 'QR check-in enabled',
};

export const liveClasses = [
    {
        id: 'lc-1',
        details: tutorialDetails,
        title: 'Tutorial: consolidation of accounts',
        course: 'ACC302',
        starts: 'Today, 16:00',
        duration: '60 min',
        mode: 'Conferencing link',
        attendees: 0,
        capacity: 68,
        state: 'scheduled',
    },
    {
        id: 'lc-2',
        title: 'Workshop: narrative voice in prose',
        course: 'ENG210',
        starts: 'Tomorrow, 09:00',
        duration: '90 min',
        mode: 'Conferencing link',
        attendees: 0,
        capacity: 82,
        state: 'scheduled',
    },
    {
        id: 'lc-3',
        title: 'Practical briefing: titration',
        course: 'CHM401',
        starts: '12 Nov 2026, 10:00',
        duration: '120 min',
        mode: 'Recording available',
        attendees: 41,
        capacity: 41,
        state: 'completed',
    },
];
