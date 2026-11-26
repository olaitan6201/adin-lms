import { NativeSelectOption } from '@/components/ui/native-select';
import { ValidatedSelect, ValidatedTextarea } from '@/components/assessments/ValidatedFields';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ExamWindow } from './ExamWindow';
import { useState } from 'react';
import { Post } from '../Post';
import { Check, Field } from '../Fields';
import { questionKinds } from '@/components/assessments/contracts';

export function SetupExam({ id }: { id: string }) {
    const [count, setCount] = useState(1);

    return (
        <Post url={`/assessment-items/${id}/exam`} button="Create examination">
            <ExamWindow />
            <Field
                name="duration_seconds"
                type="number"
                label="Duration (seconds)"
                value="3600"
            />
            <Field
                name="max_attempts"
                type="number"
                label="Attempt limit"
                value="1"
            />
            <Check name="shuffle" label="Shuffle choices" />
            {Array.from({ length: count }, (_, i) => {
                const n = `questions[${i}]`;

                return (
                    <fieldset className="grid min-w-0 gap-4 rounded-lg border p-4" key={i}>
                        <legend className="px-1 text-base font-semibold">Slot {i + 1}</legend>
                        <Field name={`${n}[topic]`} label="Question bank topic" />
                        <Label className="grid min-w-0 gap-2 leading-normal">
                            Question type
                            <ValidatedSelect name={`${n}[kind]`}>
                                {questionKinds.map((k) => (
                                    <NativeSelectOption key={k}>{k}</NativeSelectOption>
                                ))}
                            </ValidatedSelect>
                        </Label>
                        <Label className="grid min-w-0 gap-2 leading-normal">
                            Prompt
                            <ValidatedTextarea required name={`${n}[prompt]`} />
                        </Label>
                        <Label className="grid min-w-0 gap-2 leading-normal">
                            Choices (one per line for MCQ and true/false)
                            <ValidatedTextarea name={`${n}[options]`} />
                        </Label>
                        <Label className="grid min-w-0 gap-2 leading-normal">
                            Accepted answers (one per line; MCQ/TF use one choice)
                            <ValidatedTextarea name={`${n}[accepted]`} />
                        </Label>
                        <Label className="grid min-w-0 gap-2 leading-normal">
                            Matching pairs (one left =&gt; right pair per line)
                            <ValidatedTextarea name={`${n}[pairs]`} />
                        </Label>
                        <Field
                            optional
                            label="Exact accepted answer (legacy objective input)"
                            name={`${n}[key]`}
                        />
                        <Field type="number" name={`${n}[points]`} label="Possible points" />
                        <Check name={`${n}[draw]`} label="Draw randomly from this topic" />
                    </fieldset>
                );
            })}
            <Button variant="outline" type="button" onClick={() => setCount(count + 1)}>
                Add slot
            </Button>
        </Post>
    );
}
