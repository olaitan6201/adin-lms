import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { VerifiedRecord } from '@/components/shared/records/VerifiedRecord';
import { PortalField } from '@/components/forms/PortalForm';
import { FormFeedback } from '@/components/forms/FormFeedback';
import { Form } from '@inertiajs/react';

export function LinkStudentAccount() {
    return (
        <Collapsible>
            <CollapsibleTrigger asChild>
                <Button type="button" variant="outline" className="h-auto min-h-9 max-w-full whitespace-normal text-start">
                    Link a verified LMS account
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent forceMount className="space-y-3 pt-3 data-[state=closed]:hidden">
                <Form action="/students/link" method="post" className="grid gap-3">
                    {({ errors, processing }) => (
                        <FormFeedback errors={errors}>
                            <PortalField
                                label="Upstream student ID"
                                name="student"
                                required
                                error={errors.student}
                                announceError={false}
                            />
                            <PortalField
                                label="Existing LMS account email"
                                name="account"
                                type="email"
                                required
                                error={errors.account}
                                announceError={false}
                            />
                            <VerifiedRecord error={errors.verified}>
                                I checked both identities against the registrar's record.
                            </VerifiedRecord>
                            <Button className="justify-self-start" disabled={processing}>
                                Link verified account
                            </Button>
                        </FormFeedback>
                    )}
                </Form>
            </CollapsibleContent>
        </Collapsible>
    );
}
