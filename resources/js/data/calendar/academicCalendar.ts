// Illustrative local workspace records.
export const calendarEvents = [
  { id: 'ev-1', date: '2026-11-03', time: '09:00', title: 'Course delivery opens', course: 'All offerings', kind: 'Institution', owner: 'ICT Directorate' },
  { id: 'ev-2', date: '2026-11-05', time: '14:00', title: 'Course repository freeze', course: 'All offerings', kind: 'Institution', owner: 'Registrar' },
  { id: 'ev-3', date: '2026-11-07', time: '09:00', title: 'ENG210 continuous test 1', course: 'ENG210', kind: 'Examination', owner: 'Examinations Office' },
  { id: 'ev-4', date: '2026-11-10', time: '18:00', title: 'Lab report submission closes', course: 'BSC205', kind: 'Deadline', owner: 'Dr. Amaka Eze' },
  { id: 'ev-5', date: '2026-11-12', time: '09:00', title: 'Week 3 seminar', course: 'ACC302', kind: 'Teaching', owner: 'Dr. Peter Adeyemi' },
  { id: 'ev-6', date: '2026-11-12', time: '10:00', title: 'Practical briefing: titration', course: 'CHM401', kind: 'Teaching', owner: 'Dr. Grace Mbeki' },
  { id: 'ev-7', date: '2026-11-13', time: '10:00', title: 'Week 5 thermodynamics revision', course: 'CHM401', kind: 'Attendance', owner: 'Dr. Grace Mbeki' },
  { id: 'ev-8', date: '2026-11-14', time: '23:59', title: 'Journal entry problem set closes', course: 'ACC302', kind: 'Deadline', owner: 'Dr. Peter Adeyemi' },
  { id: 'ev-9', date: '2026-11-16', time: '08:00', title: 'Practical session: slide preparation', course: 'BSC205', kind: 'Attendance', owner: 'Dr. Amaka Eze' },
  { id: 'ev-10', date: '2026-11-16', time: '16:00', title: 'Tutorial: consolidation of accounts', course: 'ACC302', kind: 'Live class', owner: 'Dr. Peter Adeyemi' },
  { id: 'ev-11', date: '2026-11-18', time: '09:00', title: 'ACC302 mid-term examination', course: 'ACC302', kind: 'Examination', owner: 'Examinations Office' },
  { id: 'ev-12', date: '2026-11-20', time: '12:00', title: 'Group presentation: narrative voice', course: 'ENG210', kind: 'Deadline', owner: 'Dr. Halima Yusuf' },
  { id: 'ev-13', date: '2026-11-21', time: '13:00', title: 'BSC205 mid-term examination', course: 'BSC205', kind: 'Examination', owner: 'Examinations Office' },
  { id: 'ev-14', date: '2026-11-24', time: '23:59', title: 'Titration practical closes', course: 'CHM401', kind: 'Deadline', owner: 'Dr. Grace Mbeki' },
  { id: 'ev-15', date: '2026-11-26', time: '11:00', title: 'Curriculum committee', course: 'Institution', kind: 'Meeting', owner: 'Academic Board' },
  { id: 'ev-16', date: '2026-11-28', time: '23:59', title: 'Case analysis: IFRS 15 closes', course: 'ACC302', kind: 'Deadline', owner: 'Dr. Peter Adeyemi' },
  { id: 'ev-17', date: '2026-12-01', time: '09:00', title: 'Mid-term results release window', course: 'All offerings', kind: 'Institution', owner: 'Examinations Office' },
  { id: 'ev-18', date: '2026-12-08', time: '09:00', title: 'Practical examination window opens', course: 'All offerings', kind: 'Examination', owner: 'Examinations Office' }
];

export const calendarKinds = [
  { kind: 'Institution', tone: 'emerald' },
  { kind: 'Examination', tone: 'rose' },
  { kind: 'Deadline', tone: 'amber' },
  { kind: 'Teaching', tone: 'sky' },
  { kind: 'Live class', tone: 'sky' },
  { kind: 'Attendance', tone: 'slate' },
  { kind: 'Meeting', tone: 'slate' }
];

export const academicCalendar = {
  institution: 'Adin Open University',
  term: '2025/2026 First Semester',
  month: 'November 2026',
  today: '2026-11-26'
};
