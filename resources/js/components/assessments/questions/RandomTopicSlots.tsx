import { NativeSelectOption } from '@/components/ui/native-select';
import { ValidatedInput, ValidatedSelect } from '@/components/assessments/ValidatedFields';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

export function RandomTopicSlots({
    topics,
    draws,
    setDraws,
}: {
    topics: {
        id: string;
        topic: string;
    }[];
    draws: string[];
    setDraws: (values: string[]) => void;
}) {
    const addSlot = useRef<HTMLButtonElement>(null);
    function removeSlot() {
        if (draws.length === 1) {
            addSlot.current?.focus();
        }

        setDraws(draws.slice(0, -1));
    }

    return (
        <fieldset className="grid min-w-0 gap-4 rounded border p-4">
            <legend className="px-2 font-semibold">Random topic slots</legend>
            {draws.map((value, i) => (
                <div key={i} className="grid gap-3 border-b pb-4 sm:grid-cols-2">
                    <Label className="grid min-w-0 gap-1">
                        Topic for draw {i + 1}
                        <ValidatedSelect required name={`draws[${i}][bank_id]`}>
                            {topics.map((b) => (
                                <NativeSelectOption key={b.id} value={b.id}>
                                    {b.topic}
                                </NativeSelectOption>
                            ))}
                        </ValidatedSelect>
                    </Label>
                    <Label className="grid min-w-0 gap-1">
                        Points for draw {i + 1}
                        <ValidatedInput
                            max="1000000"
                            name={`draws[${i}][points]`}
                            type="number"
                            min="0.00000001"
                            step="0.00000001"
                            required
                            value={value}
                            onChange={(e) => setDraws(draws.map((s, n) => (n === i ? e.target.value : s)))}
                        />
                    </Label>
                </div>
            ))}
            <div className="assessment-slot-actions">
                <Button
                    ref={addSlot}
                    variant="outline"
                    type="button"
                    disabled={!topics.length || draws.length >= 200}
                    onClick={() => setDraws([...draws, '1'])}
                >
                    Add random slot
                </Button>
                {!!draws.length && (
                    <Button variant="outline" type="button" onClick={removeSlot}>
                        Remove last random slot
                    </Button>
                )}
            </div>
        </fieldset>
    );
}
