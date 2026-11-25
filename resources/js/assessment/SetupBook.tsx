import { ValidatedInput, ValidatedSelect, ValidatedTextarea } from './ValidatedFields';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { emptyItem, emptyPolicy, type PolicyDefinition } from './policyDefaults';
import { useState } from 'react';
import { Post } from './Fields';
import { PolicyItemFields, type PolicyItem } from './PolicyItemFields';

export type { PolicyDefinition } from './policyDefaults';

type SetupBookProps = {
    url: string;
    policy?: PolicyDefinition;
};

export function SetupBook({ url, policy }: SetupBookProps) {
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
            <h2 className="text-xl font-semibold tracking-tight">{policy ? 'Amend assessment policy' : 'Configure assessment policy'}</h2>
            <p>
                Item weights must total exactly 100%. Amendments create a new policy version and preserve earlier
                results.
            </p>
            <Label className="grid min-w-0 gap-2 leading-normal">
                Rounding to two decimals
                <ValidatedSelect
                    name="rounding"
                    value={data.rounding}
                    onChange={(event) => setData({ ...data, rounding: event.target.value })}
                >
                    <option value="half_up">Half up</option>
                    <option value="half_even">Half even</option>
                    <option value="floor">Round down</option>
                </ValidatedSelect>
            </Label>
            {policy && (
                <Label className="grid min-w-0 gap-2 leading-normal">
                    Reason for amendment
                    <ValidatedTextarea required name="reason" maxLength={2000} />
                </Label>
            )}
            {data.boundaries.map((boundary, index) => (
                <fieldset className="grid min-w-0 gap-4 rounded-lg border p-4" key={index}>
                    <legend className="px-1 text-base font-semibold">Boundary {index + 1}</legend>
                    <Label className="grid min-w-0 gap-2 leading-normal">
                        Minimum percent
                        <ValidatedInput
                            required
                            type="number"
                            min="0"
                            max="100"
                            step="any"
                            name={`boundaries[${index}][minimum]`}
                            value={boundary.minimum}
                            onChange={(event) => updateBoundary(index, { minimum: event.target.value })}
                        />
                    </Label>
                    <Label className="grid min-w-0 gap-2 leading-normal">
                        Grade label
                        <ValidatedInput
                            required
                            maxLength={30}
                            name={`boundaries[${index}][grade]`}
                            value={boundary.grade}
                            onChange={(event) => updateBoundary(index, { grade: event.target.value })}
                        />
                    </Label>
                    {data.boundaries.length > 1 && (
                        <Button
                            variant="outline" type="button"
                            onClick={() =>
                                setData({
                                    ...data,
                                    boundaries: data.boundaries.filter((_, i) => i !== index),
                                })
                            }
                        >
                            Remove boundary {index + 1}
                        </Button>
                    )}
                </fieldset>
            ))}
            <Button
                variant="outline" type="button"
                disabled={data.boundaries.length >= 40}
                onClick={() =>
                    setData({
                        ...data,
                        boundaries: [...data.boundaries, { minimum: '', grade: '' }],
                    })
                }
            >
                Add boundary
            </Button>
            {data.items.map((item, index) => (
                <PolicyItemFields
                    key={item.id ?? item.clientKey ?? `new-${index}`}
                    index={index}
                    item={item}
                    removable={!item.id && data.items.length > 1}
                    onChange={(patch) => updateItem(index, patch)}
                    onRemove={() =>
                        setData({
                            ...data,
                            items: data.items.filter((_, i) => i !== index),
                        })
                    }
                />
            ))}
            <Button
                variant="outline" type="button"
                disabled={data.items.length >= 100}
                onClick={() => setData({ ...data, items: [...data.items, emptyItem()] })}
            >
                Add assessment
            </Button>
        </Post>
    );
}
