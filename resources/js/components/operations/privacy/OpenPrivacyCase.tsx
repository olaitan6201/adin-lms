import { NativeSelectOption } from '@/components/ui/native-select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form } from '@inertiajs/react';
import { useState } from 'react';
import { OperationsSelect, CorrectionFocus } from '../OperationsFields';

export function OpenPrivacyCase() {
    const [kind, setKind] = useState('subject_access');

    return (
        <Card>
            <CardContent>
                <Form id="open-case" className="min-w-0" action="/operations/privacy/cases" method="post">
                    {({ processing, errors, recentlySuccessful }) => (
                        <fieldset className="grid min-w-0 gap-2">
                            <legend className="text-xl font-semibold">Open a case</legend>
                            <CorrectionFocus errors={errors} />
                            <OperationsSelect
                                label="Case type"
                                name="kind"
                                error={errors.kind}
                                value={kind}
                                onChange={(event) => setKind(event.target.value)}
                            >
                                <NativeSelectOption value="subject_access">Subject access</NativeSelectOption>
                                <NativeSelectOption value="breach">Breach response</NativeSelectOption>
                                <NativeSelectOption value="retention_hold">Retention hold</NativeSelectOption>
                                <NativeSelectOption value="records_disposition">
                                    Records disposition (custodian executed)
                                </NativeSelectOption>
                            </OperationsSelect>
                            {kind === 'records_disposition' && (
                                <p>
                                    For disposition, link the approved schedule and inventory first. A separate officer authorises the
                                    decision. The custodian checks holds again before acting in the source system and returns an execution
                                    receipt for independent verification. Advancing a case does not delete data.
                                </p>
                            )}
                            <Label htmlFor="opening-reference">External case reference</Label>
                            <Input
                                id="opening-reference"
                                name="reference"
                                required
                                maxLength={64}
                                aria-invalid={errors.reference ? true : undefined}
                                aria-describedby="reference-format"
                            />
                            <small id="reference-format">
                                {errors.reference && `${errors.reference} `}Use letters, numbers, underscores or hyphens only.
                            </small>
                            <Label htmlFor="opening-subject">Affected account UUID (required except for breaches)</Label>
                            <Input
                                id="opening-subject"
                                name="subject_id"
                                aria-invalid={errors.subject_id ? true : undefined}
                                aria-describedby="opening-subject-help"
                            />
                            <small id="opening-subject-help" className={errors.subject_id ? 'text-destructive' : undefined}>
                                Enter the affected account’s existing UUID from the restricted case system.
                            </small>
                            <Button disabled={processing}>Open case</Button>
                            {recentlySuccessful && <p role="status">Case opened.</p>}
                        </fieldset>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}
