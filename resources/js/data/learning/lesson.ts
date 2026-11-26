export const chapter = {
    objectives: [
        'Record transactions in a book of original entry.',
        'Post entries from subsidiary books to the general ledger.',
        'Explain why a trial balance agrees without proving correctness.',
    ],
    heading: 'From transaction to trial balance',
    explanation:
        'A journal is a chronological record of transactions. Each entry names the accounts that change and the amount and direction of the change. The ledger holds the running balance of each account, and the trial balance is a snapshot of those balances at a point in time.',
    transaction: 'Cash sale 50,000',
    posting: 'Dr Cash / Cr Sales',
    example: 'On 3 November a business bought 200 units of inventory for 300,000 cash. The entry is:',
    debitAccount: 'Inventory',
    amount: '300,000',
    creditAccount: 'Cash at bank',
    reason: 'An asset increases, so it is debited. Cash is also an asset, but it decreases here, so it is credited. The rule is about the direction of the change, not about the account type alone.',
};

export const practice = {
    exercise: 'Exercise set 3.1',
    exerciseMeta: '8 questions · attempt now',
    quiz: 'Topic quiz',
    quizMeta: '10 objective items · 15 min',
    readingSummary:
        'Embedded summary of the measurement and cost formula requirements, read alongside Week 4 on inventory valuation. The embedded copy is a read-only capture; the live text always opens in a new tab.',
    readingTitle: 'IFRS Foundation: IAS 2 Inventories',
    readingSource: 'external link · ifrs.org',
    resources: [
        {
            name: 'Week 3 manuscript: journals and ledgers',
            type: 'PDF',
            size: '3.2 MB',
            icon: 'document',
        },
        {
            name: 'Practice set with worked solutions',
            type: 'DOCX',
            size: '860 KB',
            icon: 'document',
        },
        {
            name: 'Trial balance template',
            type: 'XLSX',
            size: '124 KB',
            icon: 'sheet',
        },
        {
            name: 'Audio summary: the accounting cycle',
            type: 'MP3',
            size: '18.6 MB',
            icon: 'mic',
        },
        {
            name: 'IFRS 15 guidance: external reading',
            type: 'Link',
            size: 'External URL',
            icon: 'link',
        },
    ],
};

export const manuscript = {
    title: 'Week 3 · Journals and ledgers',
    subtitle: 'Chapter manuscript · 31 minutes · updated 12 Nov 2026',
    recording: 'Lecture recording: journals and ledgers',
    duration: '31:12 · caption track available',
    journalSummary: 'A journal records the transaction as it happens; the ledger accumulates balances by account.',
    trialSummary: 'A trial balance lists debit and credit balances and shows that the arithmetic of posting agrees.',
    textbook: 'Financial Accounting: An Introduction to Concepts, Methods and Uses',
    reading: 'IFRS Foundation, IAS 2 Inventories (summary note)',
    next: 'Next lesson · Week 4',
};
