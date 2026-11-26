// Illustrative workspace records.
export const sessions = [
  { id: '2025/2026', label: '2025/2026', state: 'active', start: 'Sep 2025', end: 'Jul 2026' },
  { id: '2024/2025', label: '2024/2025', state: 'archived', start: 'Sep 2024', end: 'Jul 2025' },
  { id: '2026/2027', label: '2026/2027', state: 'planned', start: 'Sep 2026', end: 'Jul 2027' }
];

export const faculties = [
  {
    id: 'f-sci',
    name: 'Faculty of Science',
    code: 'FS',
    head: 'Prof. Ernest Oyelaran',
    departments: [
      { id: 'd-bio', name: 'Biological Sciences', code: 'BSC', programmes: 2, lecturers: 14, students: 268 },
      { id: 'd-chem', name: 'Chemistry', code: 'CHM', programmes: 1, lecturers: 9, students: 141 },
      { id: 'd-math', name: 'Mathematics and Statistics', code: 'MST', programmes: 3, lecturers: 11, students: 203 }
    ]
  },
  {
    id: 'f-arts',
    name: 'Faculty of Arts and Education',
    code: 'FA',
    head: 'Dr. Ngozi Iweru',
    departments: [
      { id: 'd-eng', name: 'English and Linguistics', code: 'ENG', programmes: 2, lecturers: 12, students: 311 },
      { id: 'd-edu', name: 'Educational Management', code: 'EDM', programmes: 2, lecturers: 10, students: 187 }
    ]
  },
  {
    id: 'f-bss',
    name: 'Faculty of Business and Social Sciences',
    code: 'FB',
    head: 'Dr. Chika Anyaoku',
    departments: [
      { id: 'd-acc', name: 'Accounting and Finance', code: 'ACC', programmes: 3, lecturers: 13, students: 402 },
      { id: 'd-econ', name: 'Economics', code: 'ECN', programmes: 1, lecturers: 8, students: 174 }
    ]
  }
];

export const programmes = [
  { id: 'p-bsc', code: 'BSC', title: 'B.Sc. Biological Sciences', faculty: 'FS', department: 'BSC', level: 300, units: 24 },
  { id: 'p-chm', code: 'CHM', title: 'B.Sc. Chemistry', faculty: 'FS', department: 'CHM', level: 400, units: 22 },
  { id: 'p-mst', code: 'MST', title: 'B.Sc. Mathematics and Statistics', faculty: 'FS', department: 'MST', level: 100, units: 21 },
  { id: 'p-eng', code: 'ENG', title: 'B.A. English and Linguistics', faculty: 'FA', department: 'ENG', level: 200, units: 23 },
  { id: 'p-edm', code: 'EDM', title: 'B.Ed. Educational Management', faculty: 'FA', department: 'EDM', level: 500, units: 20 },
  { id: 'p-acc', code: 'ACC', title: 'B.Sc. Accounting and Finance', faculty: 'FB', department: 'ACC', level: 300, units: 25 },
  { id: 'p-ecn', code: 'ECN', title: 'B.Sc. Economics', faculty: 'FB', department: 'ECN', level: 100, units: 20 }
];

export const roleMatrix = [
  { role: 'Super Admin', users: 3, scope: 'Whole institution', modules: 'All 14 modules', mfa: 'Required' },
  { role: 'Institutional Admin', users: 12, scope: 'Institution-wide', modules: 'People, calendar, reports', mfa: 'Required' },
  { role: 'ICT Manager', users: 6, scope: 'Platform operations', modules: 'Settings, integrations, audit, backups', mfa: 'Required' },
  { role: 'Dean', users: 9, scope: 'Own faculty', modules: 'Approvals, reports, people', mfa: 'Required' },
  { role: 'HoD', users: 14, scope: 'Own department', modules: 'Approvals, allocations, reports', mfa: 'Required' },
  { role: 'Lecturer', users: 96, scope: 'Assigned courses', modules: 'Delivery, assessment, grading', mfa: 'Recommended' },
  { role: 'Exam Officer', users: 7, scope: 'Examination unit', modules: 'CBT, results, releases', mfa: 'Required' },
  { role: 'QA Reviewer', users: 5, scope: 'Read plus review queues', modules: 'Compliance, curriculum audit', mfa: 'Required' },
  { role: 'Student', users: 1694, scope: 'Own registrations', modules: 'Learning, assessment, results', mfa: 'Optional' }
];

export const permissionMatrix = [
  { permission: 'Manage academic structure', superAdmin: true, institutionalAdmin: true, ict: false, dean: 'Own faculty', hod: 'Own department', lecturer: false, student: false },
  { permission: 'Manage users and roles', superAdmin: true, institutionalAdmin: true, ict: false, dean: false, hod: false, lecturer: false, student: false },
  { permission: 'Approve course offerings', superAdmin: true, institutionalAdmin: true, ict: false, dean: true, hod: true, lecturer: false, student: false },
  { permission: 'Publish course content', superAdmin: true, institutionalAdmin: false, ict: false, dean: false, hod: true, lecturer: 'Own courses', student: false },
  { permission: 'Create and grade assignments', superAdmin: true, institutionalAdmin: false, ict: false, dean: false, hod: false, lecturer: 'Own courses', student: false },
  { permission: 'Schedule and run examinations', superAdmin: true, institutionalAdmin: false, ict: false, dean: false, hod: false, lecturer: 'Assigned', student: false },
  { permission: 'Release results to students', superAdmin: true, institutionalAdmin: true, ict: false, dean: false, hod: false, lecturer: false, student: false },
  { permission: 'View institutional analytics', superAdmin: true, institutionalAdmin: true, ict: true, dean: 'Own faculty', hod: 'Own department', lecturer: 'Own courses', student: 'Own records' }
];
