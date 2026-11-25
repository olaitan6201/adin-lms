import { ValidatedInput, ValidatedSelect, ValidatedTextarea } from './ValidatedFields';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { itemKinds, type ItemKind } from './contracts';
import { RubricEditor, type RubricCriteria } from './RubricEditor';

export type PolicyItem = {
    id?: string;
    clientKey?: string;
    title: string;
    kind: ItemKind;
    maximum: string;
    weight: string;
    rubric: string;
    criteria: RubricCriteria;
};

interface Props {
    index: number;
    item: PolicyItem;
    removable: boolean;
    onChange: (patch: Partial<PolicyItem>) => void;
    onRemove: () => void;
}

export function PolicyItemFields({ index, item, removable, onChange, onRemove }: Props) {
    return (
        <fieldset className="grid min-w-0 gap-4 rounded-lg border p-4">
            <legend className="px-1 text-base font-semibold">Assessment {index + 1}</legend>
            {item.id && <input type="hidden" name={`items[${index}][id]`} value={item.id} />}
            <Label className="grid min-w-0 gap-2 leading-normal">
                Title
                <ValidatedInput
                    required
                    maxLength={191}
                    name={`items[${index}][title]`}
                    value={item.title}
                    onChange={(event) => onChange({ title: event.target.value })}
                />
            </Label>
            <Label className="grid min-w-0 gap-2 leading-normal">
                Type
                <ValidatedSelect
                    name={`items[${index}][kind]`}
                    value={item.kind}
                    onChange={(event) => onChange({ kind: event.target.value as ItemKind })}
                >
                    {itemKinds.map((kind) => (
                        <option key={kind}>{kind}</option>
                    ))}
                </ValidatedSelect>
            </Label>
            <Label className="grid min-w-0 gap-2 leading-normal">
                Maximum points
                <ValidatedInput
                    required
                    type="number"
                    min="0.00000001"
                    step="any"
                    name={`items[${index}][maximum]`}
                    value={item.maximum}
                    onChange={(event) => onChange({ maximum: event.target.value })}
                />
            </Label>
            <Label className="grid min-w-0 gap-2 leading-normal">
                Weight (%)
                <ValidatedInput
                    required
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    name={`items[${index}][weight]`}
                    value={item.weight}
                    onChange={(event) => onChange({ weight: event.target.value })}
                />
            </Label>
            <Label className="grid min-w-0 gap-2 leading-normal">
                Marking guidance
                <ValidatedTextarea
                    maxLength={10000}
                    name={`items[${index}][rubric]`}
                    value={item.rubric}
                    onChange={(event) => onChange({ rubric: event.target.value })}
                />
            </Label>
            {item.kind === 'assignment' && (
                <RubricEditor
                    index={index}
                    criteria={item.criteria}
                    maximum={item.maximum}
                    onChange={(criteria) => onChange({ criteria })}
                />
            )}
            {removable && (
                <Button variant="outline" type="button" onClick={onRemove}>
                    Remove assessment {index + 1}
                </Button>
            )}
        </fieldset>
    );
}
