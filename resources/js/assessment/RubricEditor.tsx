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
        onChange(criteria.map((criterion, i) => (i === criterionIndex ? { ...criterion, ...patch } : criterion)));
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
        <fieldset>
            <legend>Scored marking rubric</legend>
            <p>
                Criterion maxima must add up to the assessment maximum. Leave the rubric empty to enter a total mark
                directly.
            </p>
            {criteria.map((criterion, criterionIndex) => (
                <fieldset key={criterionIndex}>
                    <legend>Criterion {criterionIndex + 1}</legend>
                    <label>
                        Criterion title
                        <input
                            required
                            name={`items[${index}][criteria][${criterionIndex}][title]`}
                            value={criterion.title}
                            onChange={(event) => updateCriterion(criterionIndex, { title: event.target.value })}
                        />
                    </label>
                    <label>
                        Criterion guidance
                        <textarea
                            name={`items[${index}][criteria][${criterionIndex}][description]`}
                            value={criterion.description}
                            onChange={(event) => updateCriterion(criterionIndex, { description: event.target.value })}
                        />
                    </label>
                    {criterion.levels.map((level, levelIndex) => (
                        <fieldset key={levelIndex}>
                            <legend>Level {levelIndex + 1}</legend>
                            <label>
                                Level label
                                <input
                                    required
                                    name={`items[${index}][criteria][${criterionIndex}][levels][${levelIndex}][label]`}
                                    value={level.label}
                                    onChange={(event) =>
                                        updateLevel(criterionIndex, levelIndex, { label: event.target.value })
                                    }
                                />
                            </label>
                            <label>
                                Level points
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    max={maximum || undefined}
                                    step="any"
                                    name={`items[${index}][criteria][${criterionIndex}][levels][${levelIndex}][points]`}
                                    value={level.points}
                                    onChange={(event) =>
                                        updateLevel(criterionIndex, levelIndex, { points: event.target.value })
                                    }
                                />
                            </label>
                            <label>
                                Level guidance
                                <textarea
                                    name={`items[${index}][criteria][${criterionIndex}][levels][${levelIndex}][description]`}
                                    value={level.description}
                                    onChange={(event) =>
                                        updateLevel(criterionIndex, levelIndex, { description: event.target.value })
                                    }
                                />
                            </label>
                            {criterion.levels.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        updateCriterion(criterionIndex, {
                                            levels: criterion.levels.filter((_, i) => i !== levelIndex),
                                        })
                                    }
                                >
                                    Remove level {levelIndex + 1}
                                </button>
                            )}
                        </fieldset>
                    ))}
                    <button
                        type="button"
                        disabled={criterion.levels.length >= 20}
                        onClick={() =>
                            updateCriterion(criterionIndex, {
                                levels: [...criterion.levels, { label: '', points: '', description: '' }],
                            })
                        }
                    >
                        Add level to criterion {criterionIndex + 1}
                    </button>
                    <button type="button" onClick={() => onChange(criteria.filter((_, i) => i !== criterionIndex))}>
                        Remove criterion {criterionIndex + 1}
                    </button>
                </fieldset>
            ))}
            <button type="button" disabled={criteria.length >= 50} onClick={addCriterion}>
                Add criterion to assessment {index + 1}
            </button>
        </fieldset>
    );
}
