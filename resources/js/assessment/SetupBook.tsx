import { useState } from 'react';
import { Post } from './Fields';
import { PolicyItemFields, type PolicyItem } from './PolicyItemFields';

export type PolicyDefinition = {
    rounding: string;
    boundaries: { minimum: string; grade: string }[];
    items: PolicyItem[];
};

const emptyItem = (): PolicyItem => ({
    title: '',
    kind: 'assignment',
    maximum: '',
    weight: '100',
    rubric: '',
    criteria: [],
});

const emptyPolicy = (): PolicyDefinition => ({
    rounding: 'half_up',
    boundaries: [{ minimum: '0', grade: '' }],
    items: [emptyItem()],
});

export function SetupBook({ url, policy }: { url: string; policy?: PolicyDefinition }) {
    const [data, setData] = useState<PolicyDefinition>(() => policy ?? emptyPolicy());
    const updateItem = (index: number, patch: Partial<PolicyItem>) => {
        setData((current) => ({
            ...current,
            items: current.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
        }));
    };
    const updateBoundary = (index: number, patch: Partial<PolicyDefinition['boundaries'][number]>) => {
        setData((current) => ({
            ...current,
            boundaries: current.boundaries.map((boundary, i) => (i === index ? { ...boundary, ...patch } : boundary)),
        }));
    };

    return (
        <Post url={url} button={policy ? 'Amend approved policy' : 'Activate gradebook'}>
            <h2>{policy ? 'Amend assessment policy' : 'Configure assessment policy'}</h2>
            <p>Item weights must total exactly 100%. Amendments create a new policy version and preserve earlier results.</p>
            <label>
                Rounding to two decimals
                <select
                    name="rounding"
                    value={data.rounding}
                    onChange={(event) => setData({ ...data, rounding: event.target.value })}
                >
                    <option value="half_up">Half up</option>
                    <option value="half_even">Half even</option>
                    <option value="floor">Round down</option>
                </select>
            </label>
            {policy && (
                <label>
                    Reason for amendment
                    <textarea required name="reason" maxLength={2000} />
                </label>
            )}
            {data.boundaries.map((boundary, index) => (
                <fieldset key={index}>
                    <legend>Boundary {index + 1}</legend>
                    <label>
                        Minimum percent
                        <input
                            required
                            type="number"
                            min="0"
                            max="100"
                            step="any"
                            name={`boundaries[${index}][minimum]`}
                            value={boundary.minimum}
                            onChange={(event) => updateBoundary(index, { minimum: event.target.value })}
                        />
                    </label>
                    <label>
                        Grade label
                        <input
                            required
                            maxLength={30}
                            name={`boundaries[${index}][grade]`}
                            value={boundary.grade}
                            onChange={(event) => updateBoundary(index, { grade: event.target.value })}
                        />
                    </label>
                    {data.boundaries.length > 1 && (
                        <button
                            type="button"
                            onClick={() => setData({
                                ...data,
                                boundaries: data.boundaries.filter((_, i) => i !== index),
                            })}
                        >
                            Remove boundary {index + 1}
                        </button>
                    )}
                </fieldset>
            ))}
            <button
                type="button"
                disabled={data.boundaries.length >= 40}
                onClick={() => setData({
                    ...data,
                    boundaries: [...data.boundaries, { minimum: '', grade: '' }],
                })}
            >
                Add boundary
            </button>
            {data.items.map((item, index) => (
                <PolicyItemFields
                    key={item.id ?? `new-${index}`}
                    index={index}
                    item={item}
                    removable={!item.id && data.items.length > 1}
                    onChange={(patch) => updateItem(index, patch)}
                    onRemove={() => setData({
                        ...data,
                        items: data.items.filter((_, i) => i !== index),
                    })}
                />
            ))}
            <button
                type="button"
                disabled={data.items.length >= 100}
                onClick={() => setData({ ...data, items: [...data.items, emptyItem()] })}
            >
                Add assessment
            </button>
        </Post>
    );
}
