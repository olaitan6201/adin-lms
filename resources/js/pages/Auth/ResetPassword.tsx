import { Form, Head, Link } from '@inertiajs/react';
import { PortalField, SubmitButton } from '@/components/forms/PortalForm';
import { AccountTask } from '@/components/auth/AccountTask';

const minimumPasswordLength = 12;

type ResetPasswordProps = {
    email: string;
    token: string;
};

export default function ResetPassword({ email, token }: ResetPasswordProps) {
    return (
        <AccountTask
            recovery
            context="Account recovery"
            title="Set your password"
            introduction="Use the email address that received the reset link."
        >
            <Head title="Set your password">
                <meta name="referrer" content="no-referrer" />
            </Head>
            <p id="password-help" className="text-sm text-muted-foreground">
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
            <Link href="/forgot-password" className="font-medium text-primary underline underline-offset-4">
                Request a new link
            </Link>
        </AccountTask>
    );
}
