export type Chapter = {
    objectives: string[];
    heading: string;
    explanation: string;
    transaction: string;
    posting: string;
    example: string;
    debitAccount: string;
    amount: string;
    creditAccount: string;
    reason: string;
};

export type Practice = {
    exercise: string;
    exerciseMeta: string;
    quiz: string;
    quizMeta: string;
    readingSummary: string;
    readingTitle: string;
    readingSource: string;
    resources: {
        name: string;
        type: string;
        size: string;
        icon: string;
    }[];
};

export type Manuscript = {
    title: string;
    subtitle: string;
    recording: string;
    duration: string;
    journalSummary: string;
    trialSummary: string;
    textbook: string;
    reading: string;
    next: string;
};
