import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { Check, Field, Post } from './Fields';

export function SetupAssignment({ id }: { id: string }) {
    return (
        <Post url={`/assessment-items/${id}/assignment`} button="Open assignment">
            <label>
                Instructions
                <Textarea name="instructions" required />
            </label>
            <fieldset>
                <legend>Submission window</legend>
                <div className="grid gap-3 md:grid-cols-3">
                    <Field label="Opens (server time)" name="opens_at" type="datetime-local" />
                    <Field label="Due (server time)" name="due_at" type="datetime-local" />
                    <Field label="Closes (server time)" name="closes_at" type="datetime-local" />
                </div>
            </fieldset>
            <Field label="Maximum file size in bytes" name="max_bytes" type="number" value="1048576" />
            <label>
                Accepted formats
                <NativeSelect multiple name="formats[]" defaultValue={['pdf', 'txt']} required>
                    {[
                        'txt',
                        'pdf',
                        'csv',
                        'json',
                        'py',
                        'c',
                        'cpp',
                        'java',
                        'js',
                        'ts',
                        'sql',
                        'zip',
                        'docx',
                        'xlsx',
                    ].map((format) => (
                        <option key={format}>{format}</option>
                    ))}
                </NativeSelect>
            </label>
            <Check name="allow_late" label="Allow late submissions until close" />
            <Check name="group_work" label="Group work" />
            <Check name="editable" label="Accept revisions" />
            <Field name="reference" type="file" label="Reference file (PDF or text)" optional />
        </Post>
    );
}
