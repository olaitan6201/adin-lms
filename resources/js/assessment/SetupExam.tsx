import { ExamWindow } from './ExamWindow';
import { useState } from 'react';
import { Check, Field, Post } from './Fields';
import { questionKinds } from './contracts';

export function SetupExam({ id }: { id: string }) {
    const [count, setCount] = useState(1);

    return (
        <Post url={`/assessment-items/${id}/exam`} button="Create examination">
            <ExamWindow />
            <Field name="duration_seconds" type="number" label="Duration (seconds)" value="3600" />
            <Field name="max_attempts" type="number" label="Attempt limit" value="1" />
            <Check name="shuffle" label="Shuffle choices" />
            {Array.from({ length: count }, (_, i) => {
                const n = `questions[${i}]`;

                return (
                    <fieldset key={i}>
                        <legend>Slot {i + 1}</legend>
                        <Field name={`${n}[topic]`} label="Question bank topic" />
                        <label>
                            Question type
                            <select name={`${n}[kind]`}>
                                {questionKinds.map((k) => (
                                    <option key={k}>{k}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Prompt
                            <textarea required name={`${n}[prompt]`} />
                        </label>
                        <label>
                            Choices (one per line for MCQ and true/false)
                            <textarea name={`${n}[options]`} />
                        </label>
                        <label>
                            Accepted answers (one per line; MCQ/TF use one choice)
                            <textarea name={`${n}[accepted]`} />
                        </label>
                        <label>
                            Matching pairs (one left =&gt; right pair per line)
                            <textarea name={`${n}[pairs]`} />
                        </label>
                        <Field optional label="Exact accepted answer (legacy objective input)" name={`${n}[key]`} />
                        <Field type="number" name={`${n}[points]`} label="Possible points" />
                        <Check name={`${n}[draw]`} label="Draw randomly from this topic" />
                    </fieldset>
                );
            })}
            <button type="button" onClick={() => setCount(count + 1)}>
                Add slot
            </button>
        </Post>
    );
}
