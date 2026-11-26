import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import type { PaperQuestion } from '@/types/assessments/examPaper';
import { Status } from './Controls';
import { inputClass } from './Editor';

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
                    const state = flags.includes(item.id) ? 'Flagged' : answers[item.id]?.trim() ? 'Answered' : 'Not answered';
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

export function QuestionView({
    question: q,
    index,
    count,
    value,
    flagged,
    answered,
    answer,
    flag,
    jump,
    submitButton,
}: {
    question: PaperQuestion;
    index: number;
    count: number;
    value: string;
    flagged: boolean;
    answered: number;
    answer: (value: string) => void;
    flag: () => void;
    jump: (index: number) => void;
    submitButton: React.ReactNode;
}) {
    return (
        <>
            <Card
                title={`Question ${index + 1} of ${count}`}
                subtitle="Answer every part. You may revisit a question at any time before the window closes."
                actions={
                    <>
                        <Status value={q.type} />
                        <Badge>
                            {q.marks} mark{q.marks === 1 ? '' : 's'}
                        </Badge>
                    </>
                }
            >
                <fieldset key={q.id} className="space-y-2">
                    <legend className="mb-5 text-[15px] leading-relaxed text-ink-900">{q.stem}</legend>
                    {q.options.length ? (
                        q.options.map((o) => (
                            <label
                                key={o}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 ${value === o ? 'border-brand-500 bg-brand-50/60' : 'border-ink-100 hover:border-ink-200 hover:bg-ink-50/60'}`}
                            >
                                <input
                                    type="radio"
                                    className="mt-0.5 size-4 accent-brand-600"
                                    name={q.id}
                                    value={o}
                                    checked={value === o}
                                    onChange={() => answer(o)}
                                />
                                <span className="text-[13.5px] leading-relaxed text-ink-700">{o}</span>
                            </label>
                        ))
                    ) : (
                        <textarea
                            className={inputClass}
                            aria-label={`Answer for question ${index + 1}`}
                            rows={7}
                            placeholder="Type your answer here"
                            value={value}
                            onChange={(e) => answer(e.target.value)}
                        />
                    )}
                </fieldset>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
                    <Action size="sm" icon="flag" aria-pressed={flagged} onClick={flag}>
                        {flagged ? 'Flagged for review' : 'Mark for review'}
                    </Action>
                    <small className="text-xs text-ink-400">
                        {answered} of {count} answered
                    </small>
                </div>
            </Card>
            <Card bodyClassName="flex flex-wrap items-center justify-between gap-3 p-4">
                <Action icon="chevronLeft" disabled={!index} onClick={() => jump(index - 1)}>
                    Previous
                </Action>
                <div className="flex flex-wrap gap-2">
                    <Action variant="ghost" onClick={() => answer('')}>
                        Clear response
                    </Action>
                    {index < count - 1 ? (
                        <Action variant="primary" onClick={() => jump(index + 1)}>
                            <span className="inline-flex items-center gap-2">
                                Next question
                                <Icon name="chevronRight" className="size-4" />
                            </span>
                        </Action>
                    ) : (
                        submitButton
                    )}
                </div>
            </Card>
        </>
    );
}
