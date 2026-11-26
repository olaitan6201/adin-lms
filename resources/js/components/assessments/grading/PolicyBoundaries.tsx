import { ValidatedInput } from '@/components/assessments/ValidatedFields';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { type PolicyDefinition } from './policyDefaults';

export function PolicyBoundaries({
    boundaries,
    change,
}: {
    boundaries: PolicyDefinition['boundaries'];
    change: (boundaries: PolicyDefinition['boundaries']) => void;
}) {
    function updateBoundary(index: number, patch: Partial<PolicyDefinition['boundaries'][number]>) {
        change(boundaries.map((boundary, i) => (i === index ? { ...boundary, ...patch } : boundary)));
    }
    return (
        <>
            {' '}
            {boundaries.map((boundary, index) => (
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
                    {boundaries.length > 1 && (
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => change(boundaries.filter((_, i) => i !== index))}
                        >
                            Remove boundary {index + 1}
                        </Button>
                    )}
                </fieldset>
            ))}
            <Button
                variant="outline"
                type="button"
                disabled={boundaries.length >= 40}
                onClick={() => change([...boundaries, { minimum: '', grade: '' }])}
            >
                Add boundary
            </Button>
        </>
    );
}
