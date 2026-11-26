import { Card } from '@/components/ui/layout/Card';
import type { PaperQuestion } from '@/types/assessments/examPaper';

export function QuestionPalette({
    paper,
    index,
    flags,
    answers,
    jump,
}: {
    paper: PaperQuestion[];
    index: number;
    flags: string[];
    answers: Record<string, string>;
    jump: (index: number) => void;
}) {
    return (
        <Card title="Question palette" subtitle="Answered, flagged and current">
            <div className="grid grid-cols-6 gap-2">
                {paper.map((item, i) => {
                    const state = flags.includes(item.id)
                        ? 'Flagged'
                        : answers[item.id]?.trim()
                          ? 'Answered'
                          : 'Not answered';
                    return (
                        <button
                            key={item.id}
                            type="button"
                            aria-label={`Question ${i + 1}, ${state}`}
                            aria-current={i === index ? 'step' : undefined}
                            onClick={() => jump(i)}
                            className={`flex h-9 items-center justify-center rounded-lg text-[13px] font-semibold ${state === 'Flagged' ? 'bg-amber-400 text-ink-900' : state === 'Answered' ? 'bg-brand-600 text-white' : 'border border-ink-200 bg-white text-ink-600 hover:border-ink-300'} ${i === index ? 'ring-2 ring-brand-500 ring-offset-2' : ''}`}
                        >
                            {i + 1}
                        </button>
                    );
                })}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-ink-100 pt-3 text-[11px] text-ink-500">
                {[
                    ['Answered', 'bg-brand-600'],
                    ['Not answered', 'border border-ink-300 bg-white'],
                    ['Flagged', 'bg-amber-400'],
                ].map(([label, color]) => (
                    <span key={label} className="flex items-center gap-1.5">
                        <span className={`size-3 rounded ${color}`} />
                        {label}
                    </span>
                ))}
            </div>
        </Card>
    );
}
