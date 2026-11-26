import { Label } from '@/components/ui/label';
import { RecordPanel } from '@/components/shared/records/WorkspaceRecord';
import { FormFeedback } from '@/components/forms/FormFeedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@inertiajs/react';

export function ApproveSharing() {
    return (
        <RecordPanel title="Approve sharing">
            <Form action="/guardian/permissions" method="post" resetOnSuccess className="mt-4 grid gap-4">
                {({ errors, processing, recentlySuccessful }) => (
                    <FormFeedback errors={errors}>
                        <Label className="grid gap-2">
                            Guardian account email
                            <Input type="email" name="guardian_email" required />
                        </Label>
                        <Label className="grid gap-2">
                            Upstream student reference
                            <Input name="student_reference" required />
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            The account must already hold the guardian role. Only lesson completion totals will be shared.
                        </p>
                        <Label className="grid gap-2">
                            <Checkbox name="confirmed" value="1" required /> I verified authorization to share this student's progress with
                            this guardian.
                        </Label>
                        <Button disabled={processing}>Approve progress access</Button>
                        {recentlySuccessful && <p role="status">Permission saved.</p>}
                    </FormFeedback>
                )}
            </Form>
        </RecordPanel>
    );
}
