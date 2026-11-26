import { ValidatedInput } from '@/components/assessments/ValidatedFields';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { BankQuestion } from '@/components/assessments/contracts';

export function FixedQuestionSelections({
    questions,
    points,
    setPoints,
}: {
    questions: BankQuestion[];
    points: Record<string, string>;
    setPoints: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
    return (
        <fieldset className="grid gap-4 rounded border p-4">
            <legend className="px-2 font-semibold">Select fixed question revisions</legend>
            {!questions.length && <p>No questions are available. Author questions in the bank first.</p>}
            {questions.map((question, index) => {
                const checked = points[question.id] !== undefined;
                return (
                    <article key={question.id} className="grid gap-3 border-b pb-4">
                        <Label className="flex items-start gap-2">
                            <Checkbox
                                name={`selections[${index}][version_id]`}
                                value={question.id}
                                checked={checked}
                                onCheckedChange={(selected) =>
                                    setPoints((current) => {
                                        const next = { ...current };
                                        if (selected === true) {
                                            next[question.id] = '1';
                                        } else {
                                            delete next[question.id];
                                        }

                                        return next;
                                    })
                                }
                            />
                            <span>
                                <strong>{question.topic}</strong> · {question.kind} · revision{' '}
                                {question.revision}
                                <span className="mt-1 block whitespace-pre-wrap">{question.prompt}</span>
                            </span>
                        </Label>
                        <Label className="grid min-w-0 gap-1">
                            Possible points
                            <ValidatedInput
                                type="number"
                                min="0.00000001"
                                max="1000000"
                                step="0.00000001"
                                required={checked}
                                disabled={!checked}
                                name={checked ? `selections[${index}][points]` : undefined}
                                value={points[question.id] ?? ''}
                                onChange={(event) =>
                                    setPoints((current) => ({
                                        ...current,
                                        [question.id]: event.target.value,
                                    }))
                                }
                            />
                        </Label>
                    </article>
                );
            })}
        </fieldset>
    );
}
