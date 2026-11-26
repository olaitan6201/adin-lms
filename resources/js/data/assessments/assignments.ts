import { ruleFields, timing } from './assignmentRules';
import type { WindowedAssignment, Submission } from '@/types/assessments/assignments';
import { formatInstitutionalTime } from '@/lib/submissionWindow';

type InstitutionalMinute = `${number}-${number}-${number}T${number}:${number}`;

function windowOf(opens: InstitutionalMinute, closes: InstitutionalMinute) {
    const opensAt = Date.parse(`${opens}:00+01:00`);
    const closesAt = Date.parse(`${closes}:00+01:00`);
    return {
        opensAt,
        closesAt,
        due: formatInstitutionalTime(closesAt),
        settings: { Opens: opens.slice(0, 10), Closes: closes },
    };
}

// Illustrative records for the local assessment workspace.
export const assignments: WindowedAssignment[] = [
  { id: 'as-1', instructions: 'Answer questions 1 to 8. For each transaction, state the journal entry, post it to the ledger and extract a trial balance.', attachments: 'problem-set.pdf (1.2 MB), template-trial-balance.xlsx (94 KB)', title: 'Journal entry and trial balance problem set', course: 'ACC302', ...windowOf('2026-11-01T08:00', '2026-11-14T23:59'), submissions: 51, total: 68, late: 7, marked: 44, state: 'open' },
  { id: 'as-2', title: 'Case analysis: IFRS 15 revenue recognition', course: 'ACC302', ...windowOf('2026-11-16T08:00', '2026-11-28T23:59'), submissions: 22, total: 68, late: 0, marked: 0, state: 'scheduled' },
  { id: 'as-3', title: 'Lab report: mitosis observation', course: 'BSC205', ...windowOf('2026-11-01T08:00', '2026-11-10T18:00'), submissions: 54, total: 54, late: 4, marked: 54, state: 'closed' },
  { id: 'as-4', title: 'Group presentation: narrative voice', course: 'ENG210', ...windowOf('2026-11-01T08:00', '2026-11-20T12:00'), submissions: 78, total: 82, late: 2, marked: 0, state: 'open' },
  { id: 'as-5', shortTitle: 'Practical: titration', title: 'Practical: titration and concentration', course: 'CHM401', ...windowOf('2026-11-01T08:00', '2026-11-24T23:59'), submissions: 36, total: 41, late: 1, marked: 29, state: 'open' }
];

export const submissions: Submission[] = [
  { id: 'sub-1', marks: [8, 5, 3], file: 'okonkwo_blessing_set3.pdf', feedback: 'Strong journal entries throughout. In question 3 the debit side of the asset purchase is correct but the corresponding credit to trade payables is missing, which is why the trial balance does not balance. Review the posting rule in Week 3 section 2 before the mid-term.', size: '1.4 MB', student: 'Blessing Okonkwo', matric: 'AOU/2023/0412', assignmentId: 'as-1', submitted: '12 Nov, 21:04', status: 'awaiting marking', late: false, score: null },
  { id: 'sub-2', student: 'Chinedu Okafor', matric: 'AOU/2024/1187', assignmentId: 'as-1', submitted: '14 Nov, 02:41', status: 'submitted late', late: true, score: null },
  { id: 'sub-3', student: 'Aisha Bello', matric: 'AOU/2023/0288', assignmentId: 'as-1', submitted: '11 Nov, 09:18', status: 'marked', late: false, score: 74 },
  { id: 'sub-4', student: 'Emeka Uzoma', matric: 'AOU/2022/0067', assignmentId: 'as-1', submitted: '13 Nov, 17:52', status: 'feedback returned', late: false, score: 58 },
  { id: 'sub-5', student: 'Oluwaseun Ajayi', matric: 'AOU/2023/0901', assignmentId: 'as-1', submitted: '10 Nov, 15:30', status: 'marked', late: false, score: 81 }
];

export const assignmentDesk = {
    assignments, submissions, ruleFields, timing, awaiting: 34, opens: '2026-11-07', enrolment: 68,
    guide: { scriptPreview: 'Sample script · Journal entries, ledger postings and trial balance.', rubric: ['Correct journal entry', 'Correct ledger posting', 'Trial balance extracted and balanced'], maximum: [10, 6, 4] },
};
