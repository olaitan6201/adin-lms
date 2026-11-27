import { Button } from '@/components/ui/button';
import { Form, Head, Link } from '@inertiajs/react';
import { useRef, useState, type ComponentRef } from 'react';
import { PortalField, SubmitButton } from '@/components/forms/PortalForm';
import { AccountTask } from '@/components/auth/AccountTask';

interface LoginProps {
    passwordReset: boolean;
    institutionSignIn: string | null;
}

type Credentials = {
    email: string;
    password: string;
};

export default function Login({ passwordReset, institutionSignIn }: LoginProps) {
    const form = useRef<ComponentRef<typeof Form<Credentials>>>(null);
    const identifier = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);
    const [submittedIdentifier, setSubmittedIdentifier] = useState('');
    return (
        <AccountTask
            context="Sign in"
            title="Sign in to your learning record"
            introduction="Use the identifier issued to you. The portal accepts a matric number, staff ID or institutional email address."
        >
            <Head title="Sign in" />
            <section aria-label="Account details">
                {institutionSignIn && (
                    <p className="mb-5">
                        <Button asChild variant="outline" className="h-auto min-h-11 w-full whitespace-normal">
                            <a href={institutionSignIn}>Continue with institutional sign-in</a>
                        </Button>
                    </p>
                )}
                {passwordReset && (
                    <p role="status" className="auth-status">
                        Your password has been set. Sign in with your new password.
                    </p>
                )}
                <Form
                    ref={form}
                    action="/login"
                    method="post"
                    className="grid gap-4"
                    onBefore={() => setSubmittedIdentifier(identifier.current?.value ?? '')}
                    onError={(errors) => {
                        const firstInvalid = errors.email ? identifier : password;
                        // Publish the description before moving focus, then clear the previous field.
                        requestAnimationFrame(() =>
                            requestAnimationFrame(() => {
                                firstInvalid.current?.focus();
                                form.current?.reset('password');
                            }),
                        );
                    }}
                >
                    {({ errors, processing }) => (
                        <>
                            {/* A fresh invalid input prevents stale autofill caret events from repeating the correction. */}
                            <PortalField
                                key={errors.email ? 'rejected-identifier' : 'identifier'}
                                ref={identifier}
                                defaultValue={submittedIdentifier}
                                label="Email, matric number or staff ID"
                                placeholder="AOU/2023/0412"
                                name="email"
                                aria-describedby="identifier-hint"
                                autoComplete="username"
                                autoCapitalize="none"
                                spellCheck={false}
                                error={errors.email}
                                announceError={false}
                                required
                            />
                            <p id="identifier-hint" className="-mt-3 text-xs leading-relaxed text-ink-500">
                                The identifier shown on your registration or staff card.
                            </p>
                            <PortalField
                                ref={password}
                                label="Password"
                                type="password"
                                name="password"
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                error={errors.password}
                                announceError={false}
                                required
                            />
                            <Link
                                className="auth-link -my-2 justify-self-end"
                                href="/forgot-password"
                            >
                                Forgot your password?
                            </Link>
                            <SubmitButton processing={processing}>{processing ? 'Signing in…' : 'Sign in'}</SubmitButton>
                        </>
                    )}
                </Form>
            </section>
            <div className="auth-help">
                <p>Need an account? Contact your university’s ICT office.</p>
                <p>If your role requires an authenticator, have your app ready.</p>
            </div>
        </AccountTask>
    );
}
