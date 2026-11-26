import { NativeSelectOption } from '@/components/ui/native-select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@inertiajs/react';
import { OperationsInput, OperationsSelect, CorrectionFocus } from '../OperationsFields';

export function BackupReceiptForm() {
    return (
        <Card>
            <CardContent>
                <Form id="backup-receipt" className="min-w-0" action="/operations/backup-evidence" method="post">
                    {({ errors, processing, recentlySuccessful }) => (
                        <fieldset className="grid gap-3">
                            <legend className="font-semibold">New backup receipt</legend>
                            <CorrectionFocus errors={errors} />
                            <p>Log the inspected ticket and outcome. Recording a receipt does not start a backup or restore.</p>
                            <OperationsInput
                                label="Evidence reference"
                                error={errors.reference}
                                name="reference"
                                required
                                pattern="[A-Za-z0-9_\-]{1,64}"
                            />
                            <OperationsSelect label="Observed outcome" error={errors.outcome} name="outcome">
                                <NativeSelectOption value="snapshot">Snapshot completed</NativeSelectOption>
                                <NativeSelectOption value="restored">Isolated restore checked</NativeSelectOption>
                                <NativeSelectOption value="failed">Backup or restore failed</NativeSelectOption>
                            </OperationsSelect>
                            <Button variant="outline" disabled={processing}>
                                Record backup evidence
                            </Button>
                            {recentlySuccessful && <p role="status">Backup receipt recorded.</p>}
                        </fieldset>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}
