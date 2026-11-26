import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Form, Head, Link } from '@inertiajs/react';
import { PortalField, SubmitButton } from '../../components/PortalForm';
import { RecordHeading, RecordPanel } from '@/components/shared/records/WorkspaceRecord';

export default function Challenge() {
    return (
        <main className="mx-auto grid w-full max-w-xl gap-5">
            <Head title="Verify your sign-in" />
            <RecordHeading
                area="Account security"
                title="Verify your sign-in"
                description="Open your authenticator app to finish signing in."
            />
            <RecordPanel title="Second-factor verification">
                <p id="code-help" className="text-sm text-muted-foreground">
                    Enter the current six-digit code, including any leading zero.
                </p>
                <Form action="/security/challenge" method="post" resetOnError={['code']} className="grid gap-4">
                    {({ errors, processing }) => (
                        <>
                            <PortalField
                                label="Authenticator code"
                                name="code"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                required
                                autoComplete="one-time-code"
                                aria-describedby="code-help"
                                error={errors.code}
                            />
                            <SubmitButton processing={processing}>Verify code</SubmitButton>
                        </>
                    )}
                </Form>
                <Collapsible className="border-t border-border pt-2">
                    <CollapsibleTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-auto min-h-9 max-w-full whitespace-normal text-start"
                        >
                            Need help with your authenticator?
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent forceMount className="space-y-3 pt-3 data-[state=closed]:hidden">
                        <p className="text-sm text-muted-foreground">
                            For first-time setup, ask ICT for a setup key and add it to your app. If you no longer have
                            access to your authenticator, contact ICT.
                        </p>
                    </CollapsibleContent>
                </Collapsible>
                <Button asChild variant="outline">
                    <Link href="/logout" method="post" as="button">
                        Sign out
                    </Link>
                </Button>
            </RecordPanel>
        </main>
    );
}
