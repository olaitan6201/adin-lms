import { NativeSelectOption } from '@/components/ui/native-select';
import { ValidatedSelect, ValidatedTextarea } from '@/components/assessments/ValidatedFields';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { emptyItem, emptyPolicy, type PolicyDefinition } from './policyDefaults';
import { useState } from 'react';
import { Post } from '../Post';
import { PolicyItemFields, type PolicyItem } from './PolicyItemFields';
import { PolicyBoundaries } from './PolicyBoundaries';

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

    return (
        <Post url={url} button={policy ? 'Amend approved policy' : 'Activate gradebook'}>
            <h2 className="text-xl font-semibold tracking-tight">
                {policy ? 'Amend assessment policy' : 'Configure assessment policy'}
            </h2>
            <p>
                Item weights must total exactly 100%. Amendments create a new policy version and preserve
                earlier results.
            </p>
            <Label className="grid min-w-0 gap-2 leading-normal">
                Rounding to two decimals
                <ValidatedSelect
                    name="rounding"
                    value={data.rounding}
                    onChange={(event) => setData({ ...data, rounding: event.target.value })}
                >
                    <NativeSelectOption value="half_up">Half up</NativeSelectOption>
                    <NativeSelectOption value="half_even">Half even</NativeSelectOption>
                    <NativeSelectOption value="floor">Round down</NativeSelectOption>
                </ValidatedSelect>
            </Label>
            {policy && (
                <Label className="grid min-w-0 gap-2 leading-normal">
                    Reason for amendment
                    <ValidatedTextarea required name="reason" maxLength={2000} />
                </Label>
            )}
            <PolicyBoundaries
                boundaries={data.boundaries}
                change={(boundaries) => setData((current) => ({ ...current, boundaries }))}
            />
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
                variant="outline"
                type="button"
                disabled={data.items.length >= 100}
                onClick={() => setData({ ...data, items: [...data.items, emptyItem()] })}
            >
                Add assessment
            </Button>
        </Post>
    );
}
