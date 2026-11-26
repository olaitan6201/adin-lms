import { NativeSelectOption } from '@/components/ui/native-select';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAnswerAutosave, type Question } from './useAnswerAutosave';

export type { AnswerValue, Question } from './useAnswerAutosave';
export function Answer({
    question: q,
    url,
    active,
    onProgress,
}: {
    question: Question;
    url: string;
    active: boolean;
    onProgress: (id: string, dirty: boolean, answered: boolean) => void;
}) {
    const { value, edit, message, failed, retrySave } = useAnswerAutosave({
        question: q,
        url,
        active,
        onProgress,
    });
    const matching = typeof value === 'object' ? value : {};
    const match = (left: string, right: string) => {
        const next = { ...matching };
        if (right === '') {
            delete next[left];
        } else {
            Object.keys(next).forEach((key) => {
                if (key !== left && next[key] === right) {
                    delete next[key];
                }
            });
            next[left] = right;
        }

        edit(next);
    };

    return (
        <div className="grid min-w-0 gap-3">
            {q.kind === 'matching' && q.matching ? (
                <fieldset className="grid min-w-0 gap-4 rounded-lg border p-4">
                    <legend className="px-1 text-base font-semibold">{q.prompt}</legend>
                    {q.matching.left.map((item) => (
                        <Label className="grid min-w-0 gap-2 leading-normal" key={item.id}>
                            {item.label}
                            <NativeSelect
                                disabled={!active}
                                value={matching[item.id] ?? ''}
                                onChange={(event) => match(item.id, event.target.value)}
                            >
                                <NativeSelectOption value="">Select a match</NativeSelectOption>
                                {q.matching?.right.map((right) => (
                                    <NativeSelectOption
                                        key={right.id}
                                        value={right.id}
                                        disabled={Object.entries(matching).some(
                                            ([left, selected]) => left !== item.id && selected === right.id,
                                        )}
                                    >
                                        {right.label}
                                    </NativeSelectOption>
                                ))}
                            </NativeSelect>
                        </Label>
                    ))}
                </fieldset>
            ) : q.options.length ? (
                <fieldset className="grid gap-2" disabled={!active}>
                    <legend className="mb-3 font-semibold">{q.prompt}</legend>
                    {q.options.map((option) => (
                        <label
                            key={option}
                            className="flex items-start gap-3 rounded-xl border p-3 has-checked:border-brand-700 has-checked:bg-brand-50"
                        >
                            <input
                                type="radio"
                                name={`answer-${q.id}`}
                                checked={value === option}
                                className="mt-1 accent-brand-700"
                                onChange={() => edit(option)}
                            />
                            {option}
                        </label>
                    ))}
                    {active && value !== '' && (
                        <button
                            type="button"
                            className="btn btn-ghost justify-self-start"
                            onClick={() => edit('')}
                        >
                            Clear answer
                        </button>
                    )}
                </fieldset>
            ) : (
                <Label className="grid min-w-0 gap-2 leading-normal">
                    {q.prompt}
                    <Textarea
                        className="min-h-36"
                        disabled={!active}
                        value={String(value)}
                        onChange={(event) => edit(event.target.value)}
                    />
                </Label>
            )}
            <span className="text-sm text-muted-foreground" role="status">
                {message}
            </span>
            {failed && <Button onClick={retrySave}>Retry save</Button>}
        </div>
    );
}
