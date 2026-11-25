import { Form, Head, Link } from '@inertiajs/react';
import { PortalField, SubmitButton } from '../../components/PortalForm';
import { AccountTask } from '../../components/identity/AccountTask';

export default function Challenge() {
    return (
        <AccountTask
            context="Account security"
            title="Verify your sign-in"
            introduction="Open your authenticator app to finish signing in."
        >
            <Head title="Verify your sign-in" />
            <p id="code-help" className="desk-note">
                Enter the current six-digit code, including any leading zero.
            </p>
            <Form
                action="/security/challenge"
                method="post"
                resetOnError={['code']}
                className="grid gap-4"
            >
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
            <details className="border-t border-[var(--portal-line)] pt-2">
                <summary className="min-h-11 cursor-pointer py-2 font-semibold">
                    Need help with your authenticator?
                </summary>
                <p className="desk-note">
                    For first-time setup, ask ICT for a setup key and add it to your app. If you no
                    longer have access to your authenticator, contact ICT.
                </p>
            </details>
            <Link href="/logout" method="post" as="button" className="portal-action w-fit">
                Sign out
            </Link>
        </AccountTask>
    );
}
