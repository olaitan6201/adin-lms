import { NativeSelectOption } from '@/components/ui/native-select';
import { ValidatedSelect, ValidatedTextarea } from '@/components/assessments/ValidatedFields';
import { Label } from '@/components/ui/label';
import { Check, Field, Post } from '@/components/assessments/Fields';

export function SetupAssignment({ id }: { id: string }) {
    return (
        <Post url={`/assessment-items/${id}/assignment`} button="Open assignment">
            <Label className="grid min-w-0 gap-2 leading-normal">
                Instructions
                <ValidatedTextarea name="instructions" required />
            </Label>
            <fieldset className="grid min-w-0 gap-4 rounded-lg border p-4">
                <legend className="px-1 text-base font-semibold">Submission window</legend>
                <div className="grid gap-3 md:grid-cols-3">
                    <Field label="Opens (server time)" name="opens_at" type="datetime-local" />
                    <Field label="Due (server time)" name="due_at" type="datetime-local" />
                    <Field label="Closes (server time)" name="closes_at" type="datetime-local" />
                </div>
            </fieldset>
            <Field label="Maximum file size in bytes" name="max_bytes" type="number" value="1048576" />
            <Label className="grid min-w-0 gap-2 leading-normal">
                Accepted formats
                <ValidatedSelect className="h-auto min-h-32 w-full" multiple name="formats[]" defaultValue={['pdf', 'txt']} required>
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
                        <NativeSelectOption key={format}>{format}</NativeSelectOption>
                    ))}
                </ValidatedSelect>
            </Label>
            <Check name="allow_late" label="Allow late submissions until close" />
            <Check name="group_work" label="Group work" />
            <Check name="editable" label="Accept revisions" />
            <Field name="reference" type="file" label="Reference file (PDF or text)" optional />
        </Post>
    );
}
