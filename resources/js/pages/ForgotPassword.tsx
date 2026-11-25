import { Form, Head, Link } from '@inertiajs/react';
import { PortalField, SubmitButton } from '../components/PortalForm';

export default function ForgotPassword({ requested }: { requested: boolean }) {
    return (
        <main className="mx-auto max-w-md px-6 py-16">
            <Head title="Forgot password" />
            <h1 className="mb-2 text-3xl font-semibold">Forgot your password?</h1>
            <p className="mb-6">Enter the email address you use to sign in.</p>
            {requested && (
                <p className="mb-4" role="status">
                    If your account is eligible, you’ll receive a password reset link by email.
                </p>
            )}
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
            <Link href="/login" className="mt-4 inline-block underline">
                Back to sign in
            </Link>
        </main>
    );
}
