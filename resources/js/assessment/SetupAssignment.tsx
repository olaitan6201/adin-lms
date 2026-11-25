import { Check, Field, Post, WindowFields } from './Fields';

export function SetupAssignment({ id }: { id: string }) {
    return (
        <Post url={`/assessment-items/${id}/assignment`} button="Open assignment">
            <label>
                Instructions
                <textarea name="instructions" required />
            </label>
            <WindowFields />
            <Field label="Due (server time)" name="due_at" type="datetime-local" />
            <Field label="Maximum file size in bytes" name="max_bytes" type="number" value="1048576" />
            <label>
                Accepted formats
                <select multiple name="formats[]" defaultValue={['pdf', 'txt']} required>
                    <option>pdf</option>
                    <option>txt</option>
                </select>
            </label>
            <Check name="allow_late" label="Allow late submissions until close" />
            <Check name="group_work" label="Group work" />
            <Check name="editable" label="Accept revisions" />
            <Field name="reference" type="file" label="Reference file (PDF or text)" optional />
        </Post>
    );
}
