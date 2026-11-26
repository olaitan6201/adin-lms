import { ValidatedInput, ValidatedTextarea } from '@/components/assessments/ValidatedFields';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RubricLevelFields } from './RubricLevelFields';

export type RubricLevel = {
    label: string;
    points: string;
    description: string;
};
export type RubricCriterion = {
    title: string;
    description: string;
    levels: RubricLevel[];
};
export type RubricCriteria = RubricCriterion[];

interface Props {
    index: number;
    criteria: RubricCriteria;
    maximum: string;
    onChange: (criteria: RubricCriteria) => void;
}

export function RubricEditor({ index, criteria, maximum, onChange }: Props) {
    const updateCriterion = (criterionIndex: number, patch: Partial<RubricCriterion>) => {
        onChange(
            criteria.map((criterion, i) => (i === criterionIndex ? { ...criterion, ...patch } : criterion)),
        );
    };

    const updateLevel = (criterionIndex: number, levelIndex: number, patch: Partial<RubricLevel>) => {
        const criterion = criteria[criterionIndex];
        updateCriterion(criterionIndex, {
            levels: criterion.levels.map((level, i) => (i === levelIndex ? { ...level, ...patch } : level)),
        });
    };

    const addCriterion = () =>
        onChange([
            ...criteria,
            {
                title: '',
                description: '',
                levels: [
                    { label: '', points: '0', description: '' },
                    { label: '', points: '', description: '' },
                ],
            },
        ]);

    return (
        <fieldset className="grid min-w-0 gap-4 rounded-lg border p-4">
            <legend className="px-1 text-base font-semibold">Scored marking rubric</legend>
            <p>
                Criterion maxima must add up to the assessment maximum. Leave the rubric empty to enter a
                total mark directly.
            </p>
            {criteria.map((criterion, criterionIndex) => (
                <fieldset className="grid min-w-0 gap-4 rounded-lg border p-4" key={criterionIndex}>
                    <legend className="px-1 text-base font-semibold">Criterion {criterionIndex + 1}</legend>
                    <Label className="grid min-w-0 gap-2 leading-normal">
                        Criterion title
                        <ValidatedInput
                            required
                            name={`items[${index}][criteria][${criterionIndex}][title]`}
                            value={criterion.title}
                            onChange={(event) =>
                                updateCriterion(criterionIndex, { title: event.target.value })
                            }
                        />
                    </Label>
                    <Label className="grid min-w-0 gap-2 leading-normal">
                        Criterion guidance
                        <ValidatedTextarea
                            name={`items[${index}][criteria][${criterionIndex}][description]`}
                            value={criterion.description}
                            onChange={(event) =>
                                updateCriterion(criterionIndex, { description: event.target.value })
                            }
                        />
                    </Label>
                    {criterion.levels.map((level, levelIndex) => (
                        <RubricLevelFields
                            key={levelIndex}
                            levelIndex={levelIndex}
                            level={level}
                            maximum={maximum}
                            prefix={`items[${index}][criteria][${criterionIndex}][levels][${levelIndex}]`}
                            change={(patch) => updateLevel(criterionIndex, levelIndex, patch)}
                            remove={
                                criterion.levels.length > 2
                                    ? () =>
                                          updateCriterion(criterionIndex, {
                                              levels: criterion.levels.filter((_, i) => i !== levelIndex),
                                          })
                                    : undefined
                            }
                        />
                    ))}
                    <Button
                        variant="outline"
                        type="button"
                        disabled={criterion.levels.length >= 20}
                        onClick={() =>
                            updateCriterion(criterionIndex, {
                                levels: [...criterion.levels, { label: '', points: '', description: '' }],
                            })
                        }
                    >
                        Add level to criterion {criterionIndex + 1}
                    </Button>
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => onChange(criteria.filter((_, i) => i !== criterionIndex))}
                    >
                        Remove criterion {criterionIndex + 1}
                    </Button>
                </fieldset>
            ))}
            <Button variant="outline" type="button" disabled={criteria.length >= 50} onClick={addCriterion}>
                Add criterion to assessment {index + 1}
            </Button>
        </fieldset>
    );
}
