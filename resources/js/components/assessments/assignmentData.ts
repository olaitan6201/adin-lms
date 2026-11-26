// Illustrative records for the local assessment workspace.
export const assignments = [
  { id: 'as-1', title: 'Journal entry and trial balance problem set', course: 'ACC302', due: '14 Nov 2026, 23:59', submissions: 51, total: 68, late: 7, marked: 44, state: 'open' },
  { id: 'as-2', title: 'Case analysis: IFRS 15 revenue recognition', course: 'ACC302', due: '28 Nov 2026, 23:59', submissions: 22, total: 68, late: 0, marked: 0, state: 'scheduled' },
  { id: 'as-3', title: 'Lab report: mitosis observation', course: 'BSC205', due: '10 Nov 2026, 18:00', submissions: 54, total: 54, late: 4, marked: 54, state: 'closed' },
  { id: 'as-4', title: 'Group presentation: narrative voice', course: 'ENG210', due: '20 Nov 2026, 12:00', submissions: 78, total: 82, late: 2, marked: 0, state: 'open' },
  { id: 'as-5', title: 'Practical: titration and concentration', course: 'CHM401', due: '24 Nov 2026, 23:59', submissions: 36, total: 41, late: 1, marked: 29, state: 'open' }
];

export const submissions = [
  { id: 'sub-1', student: 'Blessing Okonkwo', matric: 'AOU/2023/0412', assignment: 'Journal entry and trial balance problem set', submitted: '12 Nov, 21:04', status: 'awaiting marking', late: false, score: null },
  { id: 'sub-2', student: 'Chinedu Okafor', matric: 'AOU/2024/1187', assignment: 'Journal entry and trial balance problem set', submitted: '14 Nov, 02:41', status: 'submitted late', late: true, score: null },
  { id: 'sub-3', student: 'Aisha Bello', matric: 'AOU/2023/0288', assignment: 'Journal entry and trial balance problem set', submitted: '11 Nov, 09:18', status: 'marked', late: false, score: 74 },
  { id: 'sub-4', student: 'Emeka Uzoma', matric: 'AOU/2022/0067', assignment: 'Journal entry and trial balance problem set', submitted: '13 Nov, 17:52', status: 'feedback returned', late: false, score: 58 },
  { id: 'sub-5', student: 'Oluwaseun Ajayi', matric: 'AOU/2023/0901', assignment: 'Journal entry and trial balance problem set', submitted: '10 Nov, 15:30', status: 'marked', late: false, score: 81 }
];
