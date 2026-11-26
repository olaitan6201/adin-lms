import { Button } from '@/components/ui/button';
import { Form, Head, Link } from '@inertiajs/react';
import { useRef, useState, type ComponentRef } from 'react';
import { PortalField, SubmitButton } from '../components/PortalForm';
import { AccountTask } from '../components/identity/AccountTask';

interface LoginProps {
    passwordReset: boolean;
    institutionSignIn: string | null;
}

type Credentials = { email: string; password: string };

export default function Login({ passwordReset, institutionSignIn }: LoginProps) {
    const form = useRef<ComponentRef<typeof Form<Credentials>>>(null);
    const identifier = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);
    const [submittedIdentifier, setSubmittedIdentifier] = useState('');
    return (
        <AccountTask
            context="Institutional sign in"
            title="Sign in to your learning record"
            introduction="Use the identifier issued to you. The portal accepts a matric number, staff ID or institutional email address."
        >
            <Head title="Sign in" />
            <section aria-label="Account details">
                {institutionSignIn && (
                    <p className="mb-5">
                        <Button asChild className="h-auto min-h-9 max-w-full whitespace-normal">
                            <a href={institutionSignIn}>Continue with institutional sign-in</a>
                        </Button>
                    </p>
                )}
                {passwordReset && <p role="status">Your password has been set. Sign in with your new password.</p>}
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
                                autoComplete="username"
                                autoCapitalize="none"
                                spellCheck={false}
                                error={errors.email}
                                announceError={false}
                                required
                            />
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
                            <SubmitButton processing={processing}>Sign in</SubmitButton>
                        </>
                    )}
                </Form>
                <Link
                    className="mt-4 inline-block text-[13px] font-medium text-brand-700 hover:underline"
                    href="/forgot-password"
                >
                    Forgot your password?
                </Link>
            </section>
            <p className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-[13px] text-sky-900">
                If you need an institutional account, contact your university’s ICT office.
            </p>
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
                Some roles require an authenticator code after the password check. Have your authenticator app ready.
            </p>
        </AccountTask>
    );
}
