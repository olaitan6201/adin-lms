// Illustrative workspace records.
export const qaChecks = [
  { id: 'qc-1', course: 'ACC302', area: 'Course outline', rule: 'A course outline is recorded and matches the approved catalogue entry.', state: 'pass', note: 'Outline updated 12 Nov 2026' },
  { id: 'qc-2', course: 'ACC302', area: 'Outcome mapping', rule: 'Every course outcome maps to at least one programme outcome.', state: 'pass', note: '4 of 4 outcomes mapped' },
  { id: 'qc-3', course: 'ACC302', area: 'Teaching materials', rule: 'All required materials are uploaded and accessible to registered students.', state: 'watch', note: '2 required materials outstanding' },
  { id: 'qc-4', course: 'BSC205', area: 'Course outline', rule: 'A course outline is recorded and matches the approved catalogue entry.', state: 'pass', note: 'Outline updated 04 Nov 2026' },
  { id: 'qc-5', course: 'BSC205', area: 'Outcome mapping', rule: 'Every course outcome maps to at least one programme outcome.', state: 'pass', note: '3 of 3 outcomes mapped' },
  { id: 'qc-6', course: 'ENG210', area: 'Assessment plan', rule: 'Assessment weights total 100 per cent and match the faculty policy.', state: 'fail', note: 'Weights total 105 per cent' },
  { id: 'qc-7', course: 'ENG210', area: 'Examination security', rule: 'An examiner and a moderation plan are recorded before the examination window.', state: 'fail', note: 'No moderator recorded for continuous test 1' },
  { id: 'qc-8', course: 'CHM401', area: 'Practical safety', rule: 'A practical risk assessment is attached to every laboratory session.', state: 'watch', note: 'Risk assessment due 20 Nov 2026' },
  { id: 'qc-9', course: 'EDM505', area: 'Approval trail', rule: 'An approved catalogue version exists before an offering is published.', state: 'watch', note: 'Offering is in draft' },
  { id: 'qc-10', course: 'ECN104', area: 'Instructor allocation', rule: 'Every published offering has an assigned instructor.', state: 'fail', note: 'No instructor allocated' }
];

export const qaFindings = [
  { id: 'qf-1', severity: 'high', course: 'ECN104', title: 'Published offering has no instructor', owner: 'Dr. Chika Anyaoku', age: '3 days', state: 'open' },
  { id: 'qf-2', severity: 'high', course: 'ENG210', title: 'Assessment weights exceed 100 per cent', owner: 'Dr. Halima Yusuf', age: '1 day', state: 'open' },
  { id: 'qf-3', severity: 'medium', course: 'CHM401', title: 'Practical risk assessment missing', owner: 'Dr. Grace Mbeki', age: '2 days', state: 'acknowledged' },
  { id: 'qf-4', severity: 'medium', course: 'ACC302', title: 'Two required teaching materials outstanding', owner: 'Dr. Peter Adeyemi', age: '6 hours', state: 'open' },
  { id: 'qf-5', severity: 'low', course: 'EDM505', title: 'Offering drafted without an approved catalogue version', owner: 'Dr. Emeka Nwosu', age: '5 days', state: 'resolved' }
];

export const qaReviewQueue = [
  { id: 'qr-1', subject: 'Course structure change: ACC302', submittedBy: 'Dr. Peter Adeyemi', submitted: '24 Nov 2026', area: 'Curriculum', state: 'awaiting review' },
  { id: 'qr-2', subject: 'Outcome mapping revision: ENG210', submittedBy: 'Dr. Halima Yusuf', submitted: '22 Nov 2026', area: 'Curriculum', state: 'awaiting review' },
  { id: 'qr-3', subject: 'Student profile correction: Oluwaseun Ajayi', submittedBy: 'Registrar', submitted: '25 Nov 2026', area: 'Records', state: 'in review' },
  { id: 'qr-4', subject: 'Practical risk assessment: CHM401', submittedBy: 'Dr. Grace Mbeki', submitted: '20 Nov 2026', area: 'Delivery', state: 'awaiting review' }
];

export const qaSummary = {
  scope: '2025/2026 First Semester, all faculties',
  coursesInScope: 79,
  checksRun: 316,
  passed: 298,
  watch: 11,
  failed: 7,
  lastRun: '26 Nov 2026, 02:15'
};
