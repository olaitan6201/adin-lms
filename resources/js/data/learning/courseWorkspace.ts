export const offerings = [
  { id: 'off-1', code: 'ACC302', title: 'Intermediate Financial Accounting', instructor: 'Dr. Peter Adeyemi', students: 68, sessions: 12, completion: 46, state: 'published', mode: 'Blended', term: '2025/2026 S1' },
  { id: 'off-2', code: 'BSC205', title: 'Cell and Molecular Biology', instructor: 'Dr. Amaka Eze', students: 54, sessions: 12, completion: 61, state: 'published', mode: 'Online', term: '2025/2026 S1' },
  { id: 'off-3', code: 'ENG210', title: 'Literary Devices and Criticism', instructor: 'Dr. Halima Yusuf', students: 82, sessions: 11, completion: 38, state: 'published', mode: 'Face-to-face', term: '2025/2026 S1' },
  { id: 'off-4', code: 'CHM401', title: 'Physical Chemistry II', instructor: 'Dr. Grace Mbeki', students: 41, sessions: 12, completion: 74, state: 'published', mode: 'Blended', term: '2025/2026 S1' },
  { id: 'off-5', code: 'EDM505', title: 'Curriculum Development', instructor: 'Dr. Emeka Nwosu', students: 33, sessions: 9, completion: 12, state: 'approved', mode: 'Online', term: '2025/2026 S1' },
  { id: 'off-6', code: 'ECN104', title: 'Principles of Economics', instructor: 'Unassigned', students: 0, sessions: 0, completion: 0, state: 'draft', mode: 'Online', term: '2025/2026 S1' }
];
export const resources = [
  { name: 'Week 3 manuscript: journals and ledgers', type: 'PDF', size: '3.2 MB', version: 'v3', updated: '12 Nov 2026', access: 'Restricted to Week 3', icon: 'document' },
  { name: 'Practice set with worked solutions', type: 'DOCX', size: '860 KB', version: 'v2', updated: '09 Nov 2026', access: 'Open', icon: 'document' },
  { name: 'Lecture slides: recognition of revenue', type: 'PPTX', size: '11.4 MB', version: 'v1', updated: '02 Nov 2026', access: 'Open', icon: 'monitor' },
  { name: 'Trial balance template', type: 'XLSX', size: '124 KB', version: 'v5', updated: '28 Oct 2026', access: 'Open', icon: 'sheet' },
  { name: 'Illustration: accounting cycle flow', type: 'PNG', size: '420 KB', version: 'v1', updated: '28 Oct 2026', access: 'Open', icon: 'image' },
  { name: 'Lecture recording: revenue recognition', type: 'MP4', size: '184 MB', version: 'v1', updated: '26 Oct 2026', access: 'Downloads disabled', icon: 'video' },
  { name: 'Audio summary: the accounting cycle', type: 'MP3', size: '18.6 MB', version: 'v1', updated: '24 Oct 2026', access: 'Open', icon: 'mic' },
  { name: 'IFRS 15 guidance: external reading', type: 'Link', size: 'External URL', version: 'v1', updated: '18 Oct 2026', access: 'Open', icon: 'link' },
  { name: 'Glossary of IFRS terms', type: 'PDF', size: '540 KB', version: 'v1', updated: '20 Oct 2026', access: 'Open', icon: 'document' }
];

export const courseModules = [
  { id: 'm-1', week: 'Week 1', title: 'Introduction to the course and learning outcomes', items: 5, completion: 96, state: 'published' },
  { id: 'm-2', week: 'Week 2', title: 'Accounting equation and double-entry bookkeeping', items: 7, completion: 91, state: 'published' },
  { id: 'm-3', week: 'Week 3', title: 'The accounting cycle: journals, ledgers and trial balance', items: 9, completion: 78, state: 'published' },
  { id: 'm-4', week: 'Week 4', title: 'Recognition and measurement of assets', items: 6, completion: 64, state: 'published' },
  { id: 'm-5', week: '5', title: 'Mid-term revision and quiz', items: 4, completion: 41, state: 'published' },
  { id: 'm-6', week: 'Week 6', title: 'Inventory valuation: FIFO and weighted average', items: 8, completion: 18, state: 'draft' },
  { id: 'm-7', week: 'Week 7', title: 'Depreciation, impairment and asset disposal', items: 5, completion: 0, state: 'draft' }
];

export const studentResults = [
  { course: 'ACC302', title: 'Intermediate Financial Accounting', ca: 26, mid: 17, final: 0, total: 43, grade: 'Pending', state: 'in progress' },
  { course: 'BSC205', title: 'Cell and Molecular Biology', ca: 28, mid: 19, final: 0, total: 47, grade: 'B', state: 'released' },
  { course: 'ENG210', title: 'Literary Devices and Criticism', ca: 24, mid: 16, final: 0, total: 40, grade: 'C', state: 'released' },
  { course: 'MTH112', title: 'Calculus I', ca: 27, mid: 18, final: 0, total: 45, grade: 'B', state: 'released' }
];
export const offlineDownloads = [
  { name: 'Week 3 manuscript (PDF)', course: 'ACC302', size: '3.2 MB', synced: '12 Nov 2026' },
  { name: 'Practice set (DOCX)', course: 'ACC302', size: '860 KB', synced: '11 Nov 2026' },
  { name: 'Trial balance template (XLSX)', course: 'ACC302', size: '124 KB', synced: '09 Nov 2026' },
  { name: 'Lecture slides (PPTX)', course: 'ACC302', size: '11.4 MB', synced: '07 Nov 2026' }
];
export const studentModules = [
  { id: 'sm-1', week: 'Week 1', title: 'Introduction to financial statement preparation', state: 'complete', duration: '18 min', type: 'Manuscript' },
  { id: 'sm-2', week: 'Week 2', title: 'The accounting equation', state: 'complete', duration: '24 min', type: 'Manuscript' },
  { id: 'sm-3', week: 'Week 3', title: 'Journals and ledgers', state: 'in progress', duration: '31 min', type: 'Manuscript' },
  { id: 'sm-4', week: 'Week 3', title: 'Practice set with worked solutions', state: 'available', duration: '45 min', type: 'Practice' },
  { id: 'sm-5', week: 'Week 4', title: 'Recognition and measurement of assets', state: 'locked', duration: '22 min', type: 'Manuscript' }
];

export const assignments = [
  { id: 'as-1', title: 'Journal entry and trial balance problem set', course: 'ACC302', due: '14 Nov 2026, 23:59', submissions: 51, total: 68, late: 7, marked: 44, state: 'open' },
  { id: 'as-2', title: 'Case analysis: IFRS 15 revenue recognition', course: 'ACC302', due: '28 Nov 2026, 23:59', submissions: 22, total: 68, late: 0, marked: 0, state: 'scheduled' },
  { id: 'as-3', title: 'Lab report: mitosis observation', course: 'BSC205', due: '10 Nov 2026, 18:00', submissions: 54, total: 54, late: 4, marked: 54, state: 'closed' },
  { id: 'as-4', title: 'Group presentation: narrative voice', course: 'ENG210', due: '20 Nov 2026, 12:00', submissions: 78, total: 82, late: 2, marked: 0, state: 'open' },
  { id: 'as-5', title: 'Practical: titration and concentration', course: 'CHM401', due: '24 Nov 2026, 23:59', submissions: 36, total: 41, late: 1, marked: 29, state: 'open' }
];
export const liveClasses = [
  { id: 'lc-1', title: 'Tutorial: consolidation of accounts', course: 'ACC302', starts: 'Today, 16:00', duration: '60 min', mode: 'Conferencing link', attendees: 0, capacity: 68, state: 'scheduled' },
  { id: 'lc-2', title: 'Workshop: narrative voice in prose', course: 'ENG210', starts: 'Tomorrow, 09:00', duration: '90 min', mode: 'Conferencing link', attendees: 0, capacity: 82, state: 'scheduled' },
  { id: 'lc-3', title: 'Practical briefing: titration', course: 'CHM401', starts: '12 Nov 2026, 10:00', duration: '120 min', mode: 'Recording available', attendees: 41, capacity: 41, state: 'completed' }
];
