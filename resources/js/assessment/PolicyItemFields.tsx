import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
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
        <fieldset>
            <legend>Assessment {index + 1}</legend>
            {item.id && <input type="hidden" name={`items[${index}][id]`} value={item.id} />}
            <label>
                Title
                <Input
                    required
                    maxLength={191}
                    name={`items[${index}][title]`}
                    value={item.title}
                    onChange={(event) => onChange({ title: event.target.value })}
                />
            </label>
            <label>
                Type
                <NativeSelect
                    name={`items[${index}][kind]`}
                    value={item.kind}
                    onChange={(event) => onChange({ kind: event.target.value as ItemKind })}
                >
                    {itemKinds.map((kind) => (
                        <option key={kind}>{kind}</option>
                    ))}
                </NativeSelect>
            </label>
            <label>
                Maximum points
                <Input
                    required
                    type="number"
                    min="0.00000001"
                    step="any"
                    name={`items[${index}][maximum]`}
                    value={item.maximum}
                    onChange={(event) => onChange({ maximum: event.target.value })}
                />
            </label>
            <label>
                Weight (%)
                <Input
                    required
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    name={`items[${index}][weight]`}
                    value={item.weight}
                    onChange={(event) => onChange({ weight: event.target.value })}
                />
            </label>
            <label>
                Marking guidance
                <Textarea
                    maxLength={10000}
                    name={`items[${index}][rubric]`}
                    value={item.rubric}
                    onChange={(event) => onChange({ rubric: event.target.value })}
                />
            </label>
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
