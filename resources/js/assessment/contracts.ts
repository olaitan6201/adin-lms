export const itemKinds = ['assignment', 'exam', 'manual', 'attendance', 'continuous'] as const;
export type ItemKind = (typeof itemKinds)[number];
export type AttemptState = 'active' | 'submitted' | 'awaiting_review' | 'marked';
export const questionKinds = [
    'mcq',
    'true_false',
    'gap_fill',
    'matching',
    'short_answer',
    'essay',
    'practical',
    'programming',
] as const;

export function acceptsDirectScores(kind: ItemKind): boolean {
    return kind === 'manual' || kind === 'attendance' || kind === 'continuous';
}

export type QuestionKind = (typeof questionKinds)[number];
export type BankQuestion = {
    id: string;
    question_id: string;
    topic: string;
    kind: QuestionKind;
    prompt: string;
    revision: number;
};
export type QuestionFormValues = {
    topic: string;
    kind: QuestionKind;
    prompt: string;
    options: string;
    accepted: string;
    pairs: string;
    guide: string;
};
export type MatchingItem = { id: string; label: string };
export type QuestionDetail = QuestionFormValues & {
    id: string;
    question_id: string;
    revision: number;
    topic: string;
    marking_key: {
        accepted?: string[];
        guide?: string;
        matching?: {
            left: MatchingItem[];
            right: MatchingItem[];
            pairs: Record<string, string>;
        };
    };
    history: { id: string; revision: number; prompt: string }[];
};
