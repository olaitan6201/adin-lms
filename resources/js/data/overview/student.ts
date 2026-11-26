export const studentResults = [
  { course: 'ACC302', title: 'Intermediate Financial Accounting', ca: 26, mid: 17, final: 0, total: 43, grade: 'Pending', state: 'in progress' },
  { course: 'BSC205', title: 'Cell and Molecular Biology', ca: 28, mid: 19, final: 0, total: 47, grade: 'B', state: 'released' },
  { course: 'ENG210', title: 'Literary Devices and Criticism', ca: 24, mid: 16, final: 0, total: 40, grade: 'C', state: 'released' },
  { course: 'MTH112', title: 'Calculus I', ca: 27, mid: 18, final: 0, total: 45, grade: 'B', state: 'released' }
] as const;

export const notifications = [
  { id: 'n-1', title: 'Mid-term examination timetable published', meta: 'ACC302 - 18 Nov 2026, 09:00', tone: 'sky', time: '18 min ago' },
  { id: 'n-2', title: '34 submissions awaiting marking', meta: 'Journal entry and trial balance problem set', tone: 'amber', time: '2 h ago' },
  { id: 'n-3', title: 'Course structure copied from 2024/2025', meta: 'ENG210 - no grades or registrations copied', tone: 'emerald', time: 'Yesterday' },
] as const;

export const tiles = [
      { label: 'Registered courses', value: '4', deltaLabel: '12 units', icon: 'book' },
      { label: 'Lessons completed', value: '21', delta: '+4', deltaLabel: 'this week', icon: 'check' },
      { label: 'Assignments pending', value: '3', deltaLabel: '1 due in 2 days', icon: 'clipboard' },
      { label: 'Attendance', value: '92%', delta: '+3%', deltaLabel: 'vs last semester', icon: 'calendarCheck' }
    ] as const;

export const courses = [
    { code: 'ACC302', title: 'Intermediate Financial Accounting', value: 46, tone: 'brand', state: 'In progress' },
    { code: 'BSC205', title: 'Cell and Molecular Biology', value: 61, tone: 'brand', state: 'In progress' },
    { code: 'ENG210', title: 'Literary Devices and Criticism', value: 38, tone: 'brand', state: 'In progress' },
    { code: 'MTH112', title: 'Calculus I', value: 54, tone: 'brand', state: 'In progress' }
  ] as const;

export const schedule = [
    { when: 'Today, 16:00', title: 'Tutorial: consolidation of accounts', meta: 'ACC302 · live class' },
    { when: '14 Nov, 23:59', title: 'Journal entry and trial balance problem set', meta: 'ACC302 · assignment due' },
    { when: '18 Nov, 09:00', title: 'ACC302 mid-term examination', meta: '90 minutes · access opens 08:45' },
    { when: '21 Nov, 13:00', title: 'BSC205 mid-term examination', meta: '60 minutes' }
  ] as const;

export const pending = [
    { title: 'Journal entry and trial balance problem set', course: 'ACC302', due: '14 Nov, 23:59', state: 'Not submitted', tone: 'amber' },
    { title: 'Case analysis: IFRS 15 revenue recognition', course: 'ACC302', due: '28 Nov, 23:59', state: 'Not started', tone: 'slate' },
    { title: 'Group presentation: narrative voice', course: 'ENG210', due: '20 Nov, 12:00', state: 'Group of 4', tone: 'sky' }
  ] as const;
