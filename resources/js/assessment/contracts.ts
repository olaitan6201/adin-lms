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
