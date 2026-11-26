import { ValidatedInput, ValidatedTextarea } from '@/components/assessments/ValidatedFields';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { RubricLevel } from './RubricEditor';

export function RubricLevelFields({
    level,
    levelIndex,
    prefix,
    maximum,
    change,
    remove,
}: {
    level: RubricLevel;
    levelIndex: number;
    prefix: string;
    maximum: string;
    change: (patch: Partial<RubricLevel>) => void;
    remove?: () => void;
}) {
    return (
        <fieldset className="grid min-w-0 gap-4 rounded-lg border p-4">
            <legend className="px-1 text-base font-semibold">Level {levelIndex + 1}</legend>
            <Label className="grid min-w-0 gap-2 leading-normal">
                Level label
                <ValidatedInput
                    required
                    name={`${prefix}[label]`}
                    value={level.label}
                    onChange={(event) => change({ label: event.target.value })}
                />
            </Label>
            <Label className="grid min-w-0 gap-2 leading-normal">
                Level points
                <ValidatedInput
                    required
                    type="number"
                    min="0"
                    max={maximum || undefined}
                    step="any"
                    name={`${prefix}[points]`}
                    value={level.points}
                    onChange={(event) => change({ points: event.target.value })}
                />
            </Label>
            <Label className="grid min-w-0 gap-2 leading-normal">
                Level guidance
                <ValidatedTextarea
                    name={`${prefix}[description]`}
                    value={level.description}
                    onChange={(event) => change({ description: event.target.value })}
                />
            </Label>
            {remove && (
                <Button variant="outline" type="button" onClick={remove}>
                    Remove level {levelIndex + 1}
                </Button>
            )}
        </fieldset>
    );
}
