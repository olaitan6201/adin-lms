import type { PaperQuestion } from '@/types/assessments/examPaper';

export const paper: PaperQuestion[] = [
  {
    id: 'q-1',
    type: 'MCQ',
    marks: 2,
    stem: 'Which of the following best defines the accounting equation?',
    options: [
      'Assets = Liabilities + Owner equity',
      'Assets = Revenue - Expenses',
      'Liabilities = Assets + Owner equity',
      'Owner equity = Assets + Liabilities'
    ]
  },
  {
    id: 'q-2',
    type: 'MCQ',
    marks: 2,
    stem: 'A trial balance proves that the ledger accounts are free of error.',
    options: ['True', 'False', 'True only for single entry records', 'True if the accountant is experienced']
  },
  {
    id: 'q-3',
    type: 'True/False',
    marks: 1,
    stem: 'A debit to an asset account increases the asset.',
    options: ['True', 'False']
  },
  {
    id: 'q-4',
    type: 'Gap-fill',
    marks: 2,
    stem: 'Debit balances are listed in the ______ column of a trial balance.',
    options: ['Debit', 'Credit', 'Balance', 'Net']
  },
  {
    id: 'q-5',
    type: 'Matching',
    marks: 4,
    stem: 'Match each account to its normal balance side.',
    options: ['Cash at bank - Debit', 'Trade payables - Debit', 'Sales revenue - Credit', 'Owner capital - Credit']
  },
  {
    id: 'q-6',
    type: 'Short answer',
    marks: 10,
    stem: 'Explain why a trial balance does not detect errors of principle. Give one example.',
    options: []
  },
  {
    id: 'q-7',
    type: 'Essay',
    marks: 20,
    stem: 'Critically evaluate the limitations of historical cost accounting in a reporting context.',
    options: []
  }
];
