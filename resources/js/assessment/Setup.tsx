import { useState } from 'react';
import { Post, Field, Check, WindowFields } from './Fields';
export function SetupBook({ url }: { url: string }) {
    const [items, setItems] = useState(1),
        [bounds, setBounds] = useState(1);
    return (
        <Post url={url} button="Activate gradebook">
            <p>Enter the institutional marking policy. Item weights must total 100%.</p>
            <label>
                Rounding to two decimals
                <select name="rounding">
                    <option value="half_up">Half up</option>
                    <option value="half_even">Half even</option>
                    <option value="floor">Round down</option>
                </select>
            </label>
            {Array.from({ length: bounds }, (_, i) => (
                <fieldset key={i}>
                    <legend>Boundary {i + 1}</legend>
                    <Field
                        label="Minimum percent"
                        type="number"
                        name={`boundaries[${i}][minimum]`}
                        value={i === 0 ? '0' : undefined}
                    />
                    <Field label="Grade label" name={`boundaries[${i}][grade]`} />
                </fieldset>
            ))}
            <button type="button" onClick={() => setBounds(bounds + 1)}>
                Add boundary
            </button>
            {Array.from({ length: items }, (_, i) => (
                <fieldset key={i}>
                    <legend>Assessment {i + 1}</legend>
                    <Field label="Title" name={`items[${i}][title]`} />
                    <label>
                        Type
                        <select name={`items[${i}][kind]`}>
                            {['assignment', 'exam', 'manual', 'attendance', 'continuous'].map((k) => (
                                <option key={k}>{k}</option>
                            ))}
                        </select>
                    </label>
                    <Field label="Maximum points" type="number" name={`items[${i}][maximum]`} />
                    <Field label="Weight (%)" type="number" name={`items[${i}][weight]`} />
                    <Field label="Marking rubric" optional name={`items[${i}][rubric]`} />
                </fieldset>
            ))}
            <button type="button" onClick={() => setItems(items + 1)}>
                Add assessment
            </button>
        </Post>
    );
}
export function SetupAssignment({ id }: { id: string }) {
    return (
        <Post url={`/assessment-items/${id}/assignment`} button="Open assignment">
            <label>
                Instructions
                <textarea name="instructions" required />
            </label>
            <WindowFields />
            <Field label="Due (server time)" name="due_at" type="datetime-local" />
            <Field label="Maximum file size in bytes" name="max_bytes" type="number" value="1048576" />
            <label>
                Accepted formats
                <select multiple name="formats[]" defaultValue={['pdf', 'txt']} required>
                    <option>pdf</option>
                    <option>txt</option>
                </select>
            </label>
            <Check name="allow_late" label="Allow late submissions until close" />
            <Check name="group_work" label="Group work" />
            <Check name="editable" label="Accept revisions" />
            <Field name="reference" type="file" label="Reference file (PDF or text)" optional />
        </Post>
    );
}
export function SetupExam({ id }: { id: string }) {
    const [count, setCount] = useState(1);
    return (
        <Post url={`/assessment-items/${id}/exam`} button="Create examination">
            <WindowFields />
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
                                {[
                                    'mcq',
                                    'true_false',
                                    'gap_fill',
                                    'matching',
                                    'short_answer',
                                    'essay',
                                    'practical',
                                    'programming',
                                ].map((k) => (
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
                        <Field optional label="Exact accepted answer (objective questions)" name={`${n}[key]`} />
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
