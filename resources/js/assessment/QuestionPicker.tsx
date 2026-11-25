import { Form } from '@inertiajs/react';
import { useState } from 'react';
import { PortalField, SubmitButton } from '../components/PortalForm';
import type { BankQuestion } from './contracts';

type Props = {
    item: string;
    maximum: string;
    questions: BankQuestion[];
};

export function QuestionPicker({ item, maximum, questions }: Props) {
    const [points, setPoints] = useState<Record<string, string>>({});
    const selected = questions.filter((question) => points[question.id] !== undefined);
    const total = selected.reduce((sum, question) => sum + Number(points[question.id] || 0), 0);

    return (
        <Form action={`/assessment-items/${item}/exam`} method="post" className="grid gap-4 rounded border p-5">
            {({ processing, errors, recentlySuccessful }) => (
                <>
                    <PortalField label="Opens (server time)" name="opens_at" type="datetime-local" required error={errors.opens_at} />
                    <PortalField label="Closes (server time)" name="closes_at" type="datetime-local" required error={errors.closes_at} />
                    <PortalField label="Duration (seconds)" name="duration_seconds" type="number" min={1} max={86400} required defaultValue="3600" error={errors.duration_seconds} />
                    <PortalField label="Attempt limit" name="max_attempts" type="number" min={1} max={100} required defaultValue="1" error={errors.max_attempts} />
                    <label className="flex items-center gap-2">
                        <input name="shuffle" type="checkbox" value="1" />
                        Shuffle choices and matching options
                    </label>
                    <fieldset className="grid gap-4 rounded border p-4">
                        <legend className="px-2 font-semibold">Select fixed question revisions</legend>
                        {!questions.length && <p>No questions are available. Author questions in the bank first.</p>}
                        {questions.map((question, index) => {
                            const checked = points[question.id] !== undefined;
                            return (
                                <article key={question.id} className="grid gap-3 border-b pb-4">
                                    <label className="flex items-start gap-2">
                                        <input
                                            type="checkbox"
                                            name={`selections[${index}][version_id]`}
                                            value={question.id}
                                            checked={checked}
                                            onChange={(event) => setPoints((current) => {
                                                const next = { ...current };
                                                if (event.target.checked) next[question.id] = '1';
                                                else delete next[question.id];
                                                return next;
                                            })}
                                        />
                                        <span>
                                            <strong>{question.topic}</strong> · {question.kind} · revision {question.revision}
                                            <span className="mt-1 block whitespace-pre-wrap">{question.prompt}</span>
                                        </span>
                                    </label>
                                    <label>
                                        Possible points
                                        <input
                                            type="number"
                                            min="0.00000001"
                                            max="1000000"
                                            step="any"
                                            required={checked}
                                            disabled={!checked}
                                            name={checked ? `selections[${index}][points]` : undefined}
                                            value={points[question.id] ?? ''}
                                            onChange={(event) => setPoints((current) => ({ ...current, [question.id]: event.target.value }))}
                                            className="block w-full rounded border p-2 disabled:opacity-50"
                                        />
                                    </label>
                                </article>
                            );
                        })}
                    </fieldset>
                    <p role="status">Selected total: {total} / {maximum} points</p>
                    {Object.entries(errors).map(([key, error]) => <p role="alert" key={key}>{error}</p>)}
                    <SubmitButton processing={processing}>Create examination from selection</SubmitButton>
                    {recentlySuccessful && <p role="status">Saved.</p>}
                </>
            )}
        </Form>
    );
}
