export const libraryPreview = {
    dates: {
        'week-3-manuscript': '2026-11-12T12:00:00.000Z',
        'practice-set': '2026-11-11T12:00:00.000Z',
        'trial-balance': '2026-11-09T12:00:00.000Z',
        'revenue-notes': '2026-11-07T12:00:00.000Z',
    },
    sizes: {
        'week-3-manuscript': '3.2 MB',
        'practice-set': '860 KB',
        'trial-balance': '124 KB',
        'revenue-notes': '11.4 MB',
    },
    metrics: [
        { label: 'Saved on this device', value: '4 files', hint: '15.6 MB used' },
        { label: 'Available to save', value: '11 files', hint: 'Across 4 courses' },
        { label: 'Last sync', value: 'Today, 09:14', hint: 'All up to date' },
    ],
} as const;

export const deviceStudy = {
    mobileFeatures: [
        {
            label: 'Secure sign-in with the same credentials',
            state: 'Available',
        },
        {
            label: 'Open courses and download materials',
            state: 'Available',
        },
        {
            label: 'Play lecture videos with captions',
            state: 'Available',
        },
        {
            label: 'Submit assignments and view receipts',
            state: 'Available',
        },
        {
            label: 'Notifications for deadlines and results',
            state: 'Available',
        },
        {
            label: 'Join discussions and message staff',
            state: 'Available',
        },
        {
            label: 'Sit examinations where the device allows it',
            state: 'Device dependent',
        },
    ],
    accessibilityFeatures: [
        {
            label: 'Keyboard navigation across every screen',
            state: 'Supported',
        },
        {
            label: 'Screen reader labels on controls and charts',
            state: 'Supported',
        },
        {
            label: 'Text size control in the top bar',
            state: 'Supported',
        },
        {
            label: 'Colour contrast checked against AA thresholds',
            state: 'Supported',
        },
        {
            label: 'Captions and transcripts for recorded classes',
            state: 'Where available',
        },
        {
            label: 'Accessible examination flow',
            state: 'Supported',
        },
    ],
};
