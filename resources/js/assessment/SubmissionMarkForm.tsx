import { Check, Field, Post } from './Fields';

export type Rubric = {
    guide?: string;
    criteria?: {
        id: string;
        title: string;
        description?: string;
        levels: { id: string; label: string; points: string; description?: string }[];
    }[];
};

export function SubmissionMarkForm({ version, rubric }: { version: string; rubric: Rubric | null }) {
    return (
        <details>
            <summary>Mark this revision</summary>
            <Post url={`/submission-versions/${version}/marks`} button="Record mark">
                {rubric?.criteria?.length ? (
                    rubric.criteria.map((criterion, i) => (
                        <fieldset key={criterion.id}>
                            <legend>{criterion.title}</legend>
                            <p>{criterion.description}</p>
                            <input type="hidden" name={`selections[${i}][criterion]`} value={criterion.id} />
                            <label>
                                Performance level
                                <select required name={`selections[${i}][level]`} defaultValue="">
                                    <option value="" disabled>
                                        Select a level
                                    </option>
                                    {criterion.levels.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.label} · {l.points} points
                                            {l.description ? ` — ${l.description}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Criterion feedback
                                <textarea name={`selections[${i}][feedback]`} />
                            </label>
                        </fieldset>
                    ))
                ) : (
                    <Field label="Points" name="points" type="number" />
                )}
                <label>
                    Feedback
                    <textarea name="feedback" />
                </label>
                <Field label="Reason for this mark" name="reason" />
                <label>
                    Marked copy (.pdf or .txt)
                    <input type="file" name="script" accept=".pdf,.txt" />
                </label>
                <Check name="release" label="Return this mark and feedback to the recipients" />
            </Post>
        </details>
    );
}
