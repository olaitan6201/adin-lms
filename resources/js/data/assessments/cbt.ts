// Illustrative records for the local assessment workspace.
export const questionBanks = [
  { id: 'qb-1', name: 'ACC302 objective bank', course: 'ACC302', questions: 184, types: 'MCQ, T/F, matching', updated: '08 Nov 2026', security: 'restricted' },
  { id: 'qb-2', name: 'Accounting theory essay prompts', course: 'ACC302', questions: 42, types: 'Essay, short answer', updated: '29 Oct 2026', security: 'restricted' },
  { id: 'qb-3', name: 'BSc Biology mid-term bank', course: 'BSC205', questions: 96, types: 'MCQ, gap-fill', updated: '22 Oct 2026', security: 'restricted' },
  { id: 'qb-4', name: 'English literature comprehension', course: 'ENG210', questions: 58, types: 'MCQ, short answer', updated: '15 Oct 2026', security: 'open' },
  { id: 'qb-5', name: 'Practical programming tasks', course: 'MTH112', questions: 24, types: 'Programming', updated: '05 Oct 2026', security: 'restricted' }
];

export const questions = [
  { id: 'q-1', no: 1, type: 'MCQ', stem: 'Which of the following best defines the accounting equation?', marks: 2, difficulty: 'Easy', answered: 62 },
  { id: 'q-2', no: 2, type: 'MCQ', stem: 'A trial balance proves that the ledger accounts are free of error.', marks: 2, difficulty: 'Medium', answered: 58 },
  { id: 'q-3', no: 3, type: 'True/False', stem: 'A debit to the asset account increases the asset.', marks: 1, difficulty: 'Easy', answered: 63 },
  { id: 'q-4', no: 4, type: 'Gap-fill', stem: 'Debit balances are listed in the ____ column of a trial balance.', marks: 2, difficulty: 'Easy', answered: 44 },
  { id: 'q-5', no: 5, type: 'Matching', stem: 'Match each account to its normal balance side.', marks: 4, difficulty: 'Medium', answered: 39 },
  { id: 'q-6', no: 6, type: 'Short answer', stem: 'Explain why a trial balance does not detect errors of principle.', marks: 10, difficulty: 'Hard', answered: 31 },
  { id: 'q-7', no: 7, type: 'Essay', stem: 'Critically evaluate the limitations of historical cost accounting.', marks: 20, difficulty: 'Hard', answered: 24 }
];

export const exams = [
  { id: 'ex-1', title: 'ACC302 mid-term examination', course: 'ACC302', date: '18 Nov 2026, 09:00', duration: '90 min', candidates: 68, attempts: 68, state: 'scheduled', release: 'Manual approval' },
  { id: 'ex-2', title: 'BSC205 mid-term examination', course: 'BSC205', date: '21 Nov 2026, 13:00', duration: '60 min', candidates: 54, attempts: 54, state: 'scheduled', release: 'Manual approval' },
  { id: 'ex-3', title: 'ENG210 continuous test 1', course: 'ENG210', date: '07 Nov 2026, 09:00', duration: '45 min', candidates: 82, attempts: 81, state: 'completed', release: 'Released' },
  { id: 'ex-4', title: 'CHM401 practical quiz', course: 'CHM401', date: '12 Nov 2026, 10:00', duration: '40 min', candidates: 41, attempts: 41, state: 'completed', release: 'Pending moderation' }
];

export const examBlueprint = [
  { section: 'Objective (auto-marked)', items: 25, marks: 50, type: 'MCQ, T/F, matching' },
  { section: 'Short answer', items: 5, marks: 25, type: 'Short answer' },
  { section: 'Essay', items: 1, marks: 25, type: 'Essay' }
];

export const invigilationLog = [
  { time: '09:12', event: 'Identity verification completed', actor: 'System', level: 'info' },
  { time: '09:14', event: 'Full-screen focus change detected, candidate AOU/2024/1187', actor: 'Browser guard', level: 'warn' },
  { time: '09:41', event: 'Response autosaved', actor: 'System', level: 'info' },
  { time: '09:58', event: 'Copy attempt blocked', actor: 'Browser guard', level: 'warn' },
  { time: '10:26', event: 'Submission received', actor: 'AOU/2023/0412', level: 'ok' }
];

const papers = [
    ['AOU/2023/0412', 'Paper A-114', '18 Nov 2026, 08:52', 'Submitted'],
    ['AOU/2024/1187', 'Paper B-207', '18 Nov 2026, 08:47', 'Submitted'],
    ['AOU/2023/0288', 'Paper A-115', '18 Nov 2026, 09:01', 'Submitted'],
    ['AOU/2023/0901', 'Paper C-093', 'Not started', 'Not started'],
];

export const cbtDesk = {
    exams, questionBanks, invigilationLog, total: 406,
    bankItems: { 'qb-1': questions, 'qb-2': questions.filter(q => q.type === 'Essay' || q.type === 'Short answer') },
    blueprint: { examBlueprint, papersByExam: { 'ex-1': papers }, accommodations: { 'ex-1': 3 }, defaultCourse: 'ACC302', duration: '90', opens: '2026-11-18T08:45', closes: '2026-11-18T10:45' },
};
