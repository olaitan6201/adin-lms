import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
                    <Input name="title" required maxLength={191} defaultValue={previous?.snapshot.title} />
                </label>
                <label>
                    Course introduction and outcomes
                    <Textarea
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
                            <Input
                                name={`weeks[${i}][title]`}
                                required
                                maxLength={191}
                                defaultValue={previous?.snapshot.weeks[i]?.title}
                            />
                        </label>
                        <label>
                            Week {i + 1} activities
                            <Textarea
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
                    <Button variant="outline"
                        type="button"
                        disabled={count >= 32}
                        onClick={() => setCount(count + 1)}
                    >
                        Add week
                    </Button>
                    {count > 1 && (
                        <Button variant="outline" type="button" onClick={() => setCount(count - 1)}>
                            Remove last week
                        </Button>
                    )}
                </div>
            </EntryForm>
        </section>
    );
}
