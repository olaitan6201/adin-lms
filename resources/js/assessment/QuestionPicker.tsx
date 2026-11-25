import { NativeSelectOption } from '@/components/ui/native-select';
import { ValidatedInput, ValidatedSelect } from './ValidatedFields';
import { Label } from '@/components/ui/label';
import { FormFeedback } from '@/components/FormFeedback';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { selectionTotal } from './selectionPoints';
import { ExamWindowControls } from './ExamWindowControls';
import { Form } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { SubmitButton } from '../components/PortalForm';
import type { BankQuestion } from './contracts';

type Props = {
    item: string;
    maximum: string;
    questions: BankQuestion[];
    topics: {
        id: string;
        topic: string;
    }[];
};

export function QuestionPicker({ item, maximum, questions, topics }: Props) {
    const [points, setPoints] = useState<Record<string, string>>({});
    const [draws, setDraws] = useState<string[]>([]);
    const addSlot = useRef<HTMLButtonElement>(null);
    function removeSlot() {
        if (draws.length === 1) addSlot.current?.focus();
        setDraws(draws.slice(0, -1));
    }
    const total = selectionTotal([...Object.values(points), ...draws]);

    return (
        <Form action={`/assessment-items/${item}/exam`} method="post" className="grid min-w-0 gap-4 rounded-lg border p-4 sm:p-5 [&_button[type=submit]]:h-auto [&_button[type=submit]]:min-h-9 [&_button[type=submit]]:whitespace-normal">
            {({ processing, errors, recentlySuccessful }) => (
                <FormFeedback errors={errors}>
                    <ExamWindowControls errors={errors} />
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
                                                    if (selected === true) next[question.id] = '1';
                                                    else delete next[question.id];

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
                    <fieldset className="grid min-w-0 gap-4 rounded border p-4">
                        <legend className="px-2 font-semibold">Random topic slots</legend>
                        {draws.map((value, i) => (
                            <div key={i} className="grid gap-3 border-b pb-4 sm:grid-cols-2">
                                <Label className="grid min-w-0 gap-1">
                                    Topic for draw {i + 1}
                                    <ValidatedSelect required name={`draws[${i}][bank_id]`}>
                                        {topics.map((b) => (
                                            <NativeSelectOption key={b.id} value={b.id}>
                                                {b.topic}
                                            </NativeSelectOption>
                                        ))}
                                    </ValidatedSelect>
                                </Label>
                                <Label className="grid min-w-0 gap-1">
                                    Points for draw {i + 1}
                                    <ValidatedInput
                                        max="1000000"
                                        name={`draws[${i}][points]`}
                                        type="number"
                                        min="0.00000001"
                                        step="0.00000001"
                                        required
                                        value={value}
                                        onChange={(e) => setDraws(draws.map((s, n) => (n === i ? e.target.value : s)))}
                                    />
                                </Label>
                            </div>
                        ))}
                        <div className="flex flex-wrap gap-3">
                            <Button ref={addSlot} variant="outline" type="button" disabled={!topics.length || draws.length >= 200} onClick={() => setDraws([...draws, '1'])}>
                                Add random slot
                            </Button>
                            {!!draws.length && (
                                <Button variant="outline" type="button" onClick={removeSlot}>
                                    Remove last random slot
                                </Button>
                            )}
                        </div>
                    </fieldset>
                    <p role="status" aria-atomic="true">
                        {total === null ? 'Enter points greater than zero and at most 1000000, with up to 8 decimal places.' : `Selected total: ${total} / ${maximum} points`}
                    </p>
                    <SubmitButton processing={processing || total === null}>Create examination from selection</SubmitButton>
                    {recentlySuccessful && <p role="status">Saved.</p>}
                </FormFeedback>
            )}
        </Form>
    );
}
