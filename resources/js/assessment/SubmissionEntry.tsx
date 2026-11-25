import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { FormFeedback } from '@/components/ui/form-feedback';
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
        <section>
            <h2>Submit your work</h2>
            <Form action={url} method="post">
                {({ processing, errors, wasSuccessful }) => (
                    <FormFeedback errors={errors}>
                        {formats.includes('txt') && (
                            <label>
                                Answer
                                <Textarea name="body" />
                            </label>
                        )}
                        <label>
                            Attach submission
                            <Input type="file" name="script" accept={formats.map((f) => `.${f}`).join(',')} />
                        </label>
                        {groupWork && (
                            <label>
                                Study group
                                <NativeSelect name="group_id" required>
                                    {groups.map((group) => (
                                        <option value={group.id} key={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </label>
                        )}
                        {groupWork && !groups.length && (
                            <p>Ask your lecturer to assign you to a study group before submitting.</p>
                        )}
                        <Button disabled={processing || (groupWork && !groups.length)}>
                            {processing ? 'Submitting…' : 'Submit revision'}
                        </Button>
                        <p role="status">
                            {wasSuccessful && <>Revision received. <a href="#submissions">View submission history</a></>}
                        </p>
                    </FormFeedback>
                )}
            </Form>
        </section>
    );
}
