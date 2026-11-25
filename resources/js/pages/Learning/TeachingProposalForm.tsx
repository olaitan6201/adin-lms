import { useState } from 'react';
import { EntryForm } from './EntryForm';
import type { Plan } from './TeachingPlan';

type ProposalFormProps = {
    base: string;
    previous?: Plan;
};

export function TeachingProposalForm({ base, previous }: ProposalFormProps) {
    const [count, setCount] = useState(previous?.snapshot.weeks.length ?? 1);
    return (
        <section>
            <h2 className="text-xl font-semibold">{previous ? 'Revise your proposal' : 'Propose a teaching plan'}</h2>
            <EntryForm action={base} label="Submit for academic review">
                <input type="hidden" name="previous_revision" value={previous?.revision ?? 0} />
                <label>
                    Proposed teaching title
                    <input name="title" required maxLength={191} defaultValue={previous?.snapshot.title} />
                </label>
                <label>
                    Course introduction and outcomes
                    <textarea
                        name="introduction"
                        required
                        rows={4}
                        maxLength={20000}
                        defaultValue={previous?.snapshot.introduction}
                    />
                </label>
                {Array.from({ length: count }, (_, i) => (
                    <fieldset key={i} className="portal-panel grid gap-2 p-4">
                        <legend>Week {i + 1}</legend>
                        <label>
                            Week {i + 1} title
                            <input
                                name={`weeks[${i}][title]`}
                                required
                                maxLength={191}
                                defaultValue={previous?.snapshot.weeks[i]?.title}
                            />
                        </label>
                        <label>
                            Week {i + 1} activities
                            <textarea
                                name={`weeks[${i}][body]`}
                                required
                                rows={3}
                                maxLength={10000}
                                defaultValue={previous?.snapshot.weeks[i]?.body}
                            />
                        </label>
                    </fieldset>
                ))}
                <div className="flex gap-4">
                    <button
                        type="button"
                        className="underline"
                        disabled={count >= 32}
                        onClick={() => setCount(count + 1)}
                    >
                        Add week
                    </button>
                    {count > 1 && (
                        <button type="button" className="underline" onClick={() => setCount(count - 1)}>
                            Remove last week
                        </button>
                    )}
                </div>
            </EntryForm>
        </section>
    );
}
