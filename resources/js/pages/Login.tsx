import { Form, Head, Link } from '@inertiajs/react';
import { PortalField, SubmitButton } from '../components/PortalForm';

export default function Login({ passwordReset }: { passwordReset: boolean }) {
    return (
        <main className="mx-auto max-w-md px-6 py-16">
            <Head title="Sign in" />
            <h1 className="mb-6 text-3xl font-semibold">
                Sign in to {document.body.dataset.institution}
            </h1>
            {passwordReset && (
                <p role="status">
                    Your password has been set. Sign in with your new password.
                </p>
            )}
            <Form
                action="/login"
                method="post"
                resetOnError={['password']}
                className="grid gap-4"
            >
                {({ errors, processing }) => (
                    <>
                        <PortalField
                            label="Email, matric number or staff ID"
                            name="email"
                            autoComplete="username"
                            autoCapitalize="none"
                            spellCheck={false}
                            error={errors.email}
                            required
                        />
                        <PortalField
                            label="Password"
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            error={errors.password}
                            required
                        />
                        <SubmitButton processing={processing}>Sign in</SubmitButton>
                    </>
                )}
            </Form>
            <Link className="mt-4 inline-block underline" href="/forgot-password">
                Forgot your password?
            </Link>
        </main>
    );
}
