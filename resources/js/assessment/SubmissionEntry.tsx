import { NativeSelectOption } from '@/components/ui/native-select';
import { ValidatedInput, ValidatedSelect, ValidatedTextarea } from './ValidatedFields';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormFeedback } from '@/components/FormFeedback';
import { Form } from '@inertiajs/react';

interface Props {
    url: string;
    formats: string[];
    groupWork: boolean;
    groups: {
        id: string;
        name: string;
    }[];
}

export function SubmissionEntry({ url, formats, groupWork, groups }: Props) {
    return (
        <section className="min-w-0 space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Submit your work</h2>
            <Form action={url} method="post" className="grid min-w-0 gap-4 py-2">
                {({ processing, errors, wasSuccessful }) => (
                    <FormFeedback errors={errors}>
                        {formats.includes('txt') && (
                            <Label className="grid min-w-0 gap-2 leading-normal">
                                Answer
                                <ValidatedTextarea name="body" />
                            </Label>
                        )}
                        <Label className="grid min-w-0 gap-2 rounded-xl border-2 border-dashed bg-muted/40 p-4 leading-normal">
                            Attach submission
                            <ValidatedInput type="file" name="script" accept={formats.map((f) => `.${f}`).join(',')} />
                        </Label>
                        {groupWork && (
                            <Label className="grid min-w-0 gap-2 leading-normal">
                                Study group
                                <ValidatedSelect name="group_id" required>
                                    {groups.map((group) => (
                                        <NativeSelectOption value={group.id} key={group.id}>
                                            {group.name}
                                        </NativeSelectOption>
                                    ))}
                                </ValidatedSelect>
                            </Label>
                        )}
                        {groupWork && !groups.length && (
                            <p>Ask your lecturer to assign you to a study group before submitting.</p>
                        )}
                        <Button type="submit" disabled={processing || (groupWork && !groups.length)}>
                            {processing ? 'Submitting…' : 'Submit revision'}
                        </Button>
                        <p role="status">
                            {wasSuccessful && <>Revision received. <a className="text-primary underline underline-offset-4" href="#submissions">View submission history</a></>}
                        </p>
                    </FormFeedback>
                )}
            </Form>
        </section>
    );
}
