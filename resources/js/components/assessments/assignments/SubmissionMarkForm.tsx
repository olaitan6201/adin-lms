import { NativeSelectOption } from '@/components/ui/native-select';
import { CourseDisclosure } from '@/components/learning/CourseDisclosure';
import { ValidatedInput, ValidatedSelect, ValidatedTextarea } from '@/components/assessments/ValidatedFields';
import { Label } from '@/components/ui/label';
import { Check, Field, Post } from '@/components/assessments/Fields';

export type Rubric = {
    guide?: string;
    criteria?: {
        id: string;
        title: string;
        description?: string;
        levels: {
            id: string;
            label: string;
            points: string;
            description?: string;
        }[];
    }[];
};

type SubmissionMarkFormProps = {
    version: string;
    rubric: Rubric | null;
};

export function SubmissionMarkForm({ version, rubric }: SubmissionMarkFormProps) {
    return (
        <CourseDisclosure label="Mark this revision">
            <Post url={`/submission-versions/${version}/marks`} button="Record mark">
                {rubric?.criteria?.length ? (
                    rubric.criteria.map((criterion, i) => (
                        <fieldset className="grid min-w-0 gap-4 rounded-lg border p-4" key={criterion.id}>
                            <legend className="px-1 text-base font-semibold">{criterion.title}</legend>
                            <p>{criterion.description}</p>
                            <input type="hidden" name={`selections[${i}][criterion]`} value={criterion.id} />
                            <Label className="grid min-w-0 gap-2 leading-normal">
                                Performance level
                                <ValidatedSelect required name={`selections[${i}][level]`} defaultValue="">
                                    <NativeSelectOption value="" disabled>
                                        Select a level
                                    </NativeSelectOption>
                                    {criterion.levels.map((l) => (
                                        <NativeSelectOption key={l.id} value={l.id}>
                                            {l.label} · {l.points} points
                                            {l.description ? ` — ${l.description}` : ''}
                                        </NativeSelectOption>
                                    ))}
                                </ValidatedSelect>
                            </Label>
                            <Label className="grid min-w-0 gap-2 leading-normal">
                                Criterion feedback
                                <ValidatedTextarea name={`selections[${i}][feedback]`} />
                            </Label>
                        </fieldset>
                    ))
                ) : (
                    <Field label="Points" name="points" type="number" />
                )}
                <Label className="grid min-w-0 gap-2 leading-normal">
                    Feedback
                    <ValidatedTextarea name="feedback" />
                </Label>
                <Field label="Reason for this mark" name="reason" />
                <Label className="grid min-w-0 gap-2 leading-normal">
                    Marked copy (.pdf or .txt)
                    <ValidatedInput type="file" name="script" accept=".pdf,.txt" />
                </Label>
                <Check name="release" label="Return this mark and feedback to the recipients" />
            </Post>
        </CourseDisclosure>
    );
}
