import { useState } from 'react';
import { Field, Post } from './Fields';
import { itemKinds } from './contracts';

export function SetupBook({ url }: { url: string }) {
    const [items, setItems] = useState(1);
    const [bounds, setBounds] = useState(1);

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
                            {itemKinds.map((k) => (
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
