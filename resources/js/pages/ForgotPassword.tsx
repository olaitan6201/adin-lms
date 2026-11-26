import { Form, Head, Link } from '@inertiajs/react';
import { PortalField, SubmitButton } from '../components/PortalForm';
import { AccountTask } from '../components/identity/AccountTask';

export default function ForgotPassword({ requested }: { requested: boolean }) {
    return (
        <AccountTask
            recovery
            context="Account recovery"
            title="Forgot your password?"
            introduction="Request a reset link using the email address you use to sign in."
        >
            <Head title="Forgot password" />
            <p role="status" className="empty:hidden">
                {requested &&
                    'If your account is eligible, you’ll receive a password reset link by email. Check your inbox and spam folder.'}
            </p>
            <Form action="/forgot-password" method="post" className="grid gap-4">
                {({ errors, processing }) => (
                    <>
                        <PortalField
                            label="Email address"
                            type="email"
                            name="email"
                            autoComplete="email"
                            error={errors.email}
                            required
                        />
                        <SubmitButton processing={processing}>Send reset link</SubmitButton>
                    </>
                )}
            </Form>
            <Link href="/login" className="font-medium text-primary underline underline-offset-4">
                Back to sign in
            </Link>
        </AccountTask>
    );
}
