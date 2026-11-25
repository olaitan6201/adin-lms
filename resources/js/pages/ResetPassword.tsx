import { Form, Head, Link } from '@inertiajs/react';
import { PortalField, SubmitButton } from '../components/PortalForm';

const minimumPasswordLength = 12;

type ResetPasswordProps = {
    email: string;
    token: string;
};

export default function ResetPassword({ email, token }: ResetPasswordProps) {
    return (
        <main className="mx-auto max-w-md px-6 py-16">
            <Head title="Set your password">
                <meta name="referrer" content="no-referrer" />
            </Head>
            <h1 className="mb-2 text-3xl font-semibold">Set your password</h1>
            <p id="password-help" className="mb-6">
                Choose a password with at least {minimumPasswordLength} characters.
            </p>
            <Form
                action="/reset-password"
                method="post"
                className="grid gap-4"
                resetOnError={['password', 'password_confirmation']}
            >
                {({ errors, processing }) => (
                    <>
                        <input type="hidden" name="token" value={token} />
                        <PortalField
                            label="Email address"
                            type="email"
                            name="email"
                            defaultValue={email}
                            autoComplete="email"
                            error={errors.email}
                            required
                        />
                        <PortalField
                            label="New password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            minLength={minimumPasswordLength}
                            aria-describedby="password-help"
                            error={errors.password}
                            required
                        />
                        <PortalField
                            label="Confirm new password"
                            name="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            minLength={minimumPasswordLength}
                            error={errors.password_confirmation}
                            required
                        />
                        {errors.token && <p role="alert">{errors.token}</p>}
                        <SubmitButton processing={processing}>Set password</SubmitButton>
                    </>
                )}
            </Form>
            <Link href="/forgot-password" className="mt-4 inline-block underline">
                Request a new link
            </Link>
        </main>
    );
}
