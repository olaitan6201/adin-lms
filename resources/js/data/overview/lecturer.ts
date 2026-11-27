import { offerings as catalogue } from '@/data/learning/courseWorkspace';

export const offerings = catalogue.slice(0, 4);

export const submissions = [
  { id: 'sub-1', student: 'Blessing Okonkwo', matric: 'AOU/2023/0412', assignment: 'Journal entry and trial balance problem set', submitted: '12 Nov, 21:04', status: 'awaiting marking', late: false, score: null },
  { id: 'sub-2', student: 'Chinedu Okafor', matric: 'AOU/2024/1187', assignment: 'Journal entry and trial balance problem set', submitted: '14 Nov, 02:41', status: 'submitted late', late: true, score: null },
] as const;

export const tiles = [
      { label: 'Allocated courses', value: '3', delta: '68', deltaLabel: 'students total', icon: 'book', spark: { values: [2, 2, 2, 3, 3, 3], color: '#10B981' } },
      { label: 'Awaiting marking', value: '34', delta: '2', deltaLabel: 'new since yesterday', icon: 'clipboard', spark: { values: [18, 24, 22, 31, 29, 34], color: '#F59E0B' } },
      { label: 'Live classes this week', value: '4', delta: '2', deltaLabel: 'recordings to publish', icon: 'video', spark: { values: [1, 3, 2, 4, 4, 4], color: '#3B82F6' } },
      { label: 'Mean score, ACC302', value: '72', delta: '+4', deltaLabel: 'vs mid-term 2024/2025', icon: 'chart', spark: { values: [64, 63, 66, 69, 71, 72], color: '#33475F' } }
    ] as const;

export const schedule = [
    { when: 'Today, 16:00', title: 'Tutorial: consolidation of accounts', meta: 'ACC302 · 60 min · 68 enrolled' },
    { when: 'Tomorrow, 09:00', title: 'Workshop: narrative voice in prose', meta: 'ENG210 · 90 min · 82 enrolled' },
    { when: '18 Nov, 09:00', title: 'ACC302 mid-term examination', meta: '90 min · 68 candidates · invigilation slot 1' },
    { when: '21 Nov, 13:00', title: 'BSC205 mid-term examination', meta: '60 min · 54 candidates' }
  ] as const;
