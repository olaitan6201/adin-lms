import { Alert, AlertDescription } from '@/components/ui/alert';
import { RegistryPanel } from '@/components/academics/RegistryPanel';
import { DeskHeading } from '@/components/academics/DeskHeading';
import { Button } from '@/components/ui/button';
import { Form, Head } from '@inertiajs/react';

type ConsentProps = {
    granted: boolean;
    notice: string;
};

export default function OperationsConsent({ granted, notice }: ConsentProps) {
    return (
        <main className="w-full min-w-0 space-y-5 wrap-anywhere">
            <Head title="Feedback consent" />
            <DeskHeading
                area="Data protection"
                title="Optional course feedback"
            >
                Notice {notice}: You may allow the institution to invite you to give course feedback. This is
                optional and does not affect your registration, access or grades. You can withdraw here.
            </DeskHeading>
            <div className="max-w-2xl">
                <RegistryPanel title="Feedback consent">
                    <p>Current choice: {granted ? 'Consent granted' : 'No active consent'}</p>
                    <Form
                        method="post"
                        action="/operations/consent"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <input
                                    type="hidden"
                                    name="notice"
                                    value={notice}
                                />
                                <input
                                    type="hidden"
                                    name="grant"
                                    value={granted ? '0' : '1'}
                                />
                                <Button disabled={processing}>
                                    {granted ? 'Withdraw consent' : 'Give consent'}
                                </Button>
                                {recentlySuccessful && <p role="status">Choice saved.</p>}
                                {Object.keys(errors).length > 0 && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{Object.values(errors)[0]}</AlertDescription>
                                    </Alert>
                                )}
                            </>
                        )}
                    </Form>
                </RegistryPanel>
            </div>
        </main>
    );
}
