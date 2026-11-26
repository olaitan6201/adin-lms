// Illustrative records for the local assessment workspace.
export const gradeWeights = [
  { item: 'Continuous assessment', weight: 30, source: 'Assignments, quizzes, participation', policy: 'Auto + lecturer entry' },
  { item: 'Mid-term examination', weight: 20, source: 'CBT exam 1', policy: 'Auto-marked, moderated' },
  { item: 'Practical / field work', weight: 10, source: 'Lab reports', policy: 'Manual entry' },
  { item: 'Final examination', weight: 40, source: 'CBT exam 2', policy: 'Auto + manual moderation' }
];

export const gradeRows = [
  { student: 'Blessing Okonkwo', matric: 'AOU/2023/0412', ca: 16, participation: 10, mid: 17, practical: 9, final: 30, total: 82, grade: 'B', state: 'published' },
  { student: 'Aisha Bello', matric: 'AOU/2023/0288', ca: 19, participation: 10, mid: 19, practical: 10, final: 35, total: 93, grade: 'A', state: 'published' },
  { student: 'Oluwaseun Ajayi', matric: 'AOU/2023/0901', ca: 15, participation: 9, mid: 15, practical: 9, final: 27, total: 75, grade: 'B', state: 'approved' },
  { student: 'Chinedu Okafor', matric: 'AOU/2024/1187', ca: 12, participation: 9, mid: 14, practical: 8, final: 23, total: 66, grade: 'C', state: 'moderation' },
  { student: 'Emeka Uzoma', matric: 'AOU/2022/0067', ca: 9, participation: 9, mid: 12, practical: 7, final: 20, total: 57, grade: 'D', state: 'moderation' },
  { student: 'Fatima Sanni', matric: 'AOU/2024/1322', ca: 3, participation: 9, mid: 9, practical: 6, final: 14, total: 41, grade: 'F', state: 'entered' }
];

export const scoreHistory = [
  { when: '14 Nov 2026, 09:42', who: 'Dr. Peter Adeyemi', change: 'CA 24 to 26', reason: 'Moderation adjustment approved' },
  { when: '13 Nov 2026, 16:05', who: 'Dr. Peter Adeyemi', change: 'Final 28 to 30', reason: 'Re-mark of essay 1' },
  { when: '12 Nov 2026, 11:20', who: 'System', change: 'Mid-term imported', reason: 'CBT exam 1 sync' }
];

const boundaries: [string, number][] = [['A', 70], ['B', 60], ['C', 50], ['D', 45], ['E', 40], ['F', 0]];
const metrics = [['ca', 'Assign. /20', 20], ['participation', 'Particip. /10', 10], ['mid', 'Mid /20', 20], ['practical', 'Prac /10', 10], ['final', 'Final /40', 40]] as const;
const rubric: [string, string][] = [['Correct journal entry', '10 marks · 4 levels'], ['Correct ledger posting', '6 marks · 3 levels'], ['Trial balance extracted and balanced', '4 marks · 3 levels'], ['Presentation and clarity', '5 marks · 3 levels']];

export const gradeDesk = { gradeRows, scoreHistory, policy: { gradeWeights, boundaries, rubric }, metrics, course: 'ACC302' };
