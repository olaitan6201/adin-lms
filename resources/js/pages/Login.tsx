import { Form, Head, Link } from '@inertiajs/react';
import { useRef, type ComponentRef } from 'react';
import { PortalField, SubmitButton } from '../components/PortalForm';

interface LoginProps {
    passwordReset: boolean;
    institutionSignIn: string | null;
}

type Credentials = { email: string; password: string };

export default function Login({ passwordReset, institutionSignIn }: LoginProps) {
    const form = useRef<ComponentRef<typeof Form<Credentials>>>(null);
    const identifier = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);
    return (
        <main className="portal-page portal-entry">
            <Head title="Sign in" />
            <header className="entry-intro">
                <p className="portal-kicker">Learning portal</p>
                <h1 className="portal-title">Sign in</h1>
                <p>Use your institutional account to open your academic workspace.</p>
            </header>
            <section aria-label="Account details" className="portal-panel desk-shelf entry-form">
                {institutionSignIn && (
                    <p className="mb-5">
                        <a href={institutionSignIn} className="portal-action">
                            Continue with institutional sign-in
                        </a>
                    </p>
                )}
                {passwordReset && <p role="status">Your password has been set. Sign in with your new password.</p>}
                <Form
                    ref={form}
                    action="/login"
                    method="post"
                    className="grid gap-4"
                    onError={(errors) => {
                        const firstInvalid = errors.email ? identifier : password;
                        requestAnimationFrame(() => {
                            // Clear after focus moves so the old field's caret does not interrupt the error.
                            firstInvalid.current?.focus();
                            form.current?.reset('password');
                        });
                    }}
                >
                    {({ errors, processing }) => (
                        <>
                            <PortalField
                                ref={identifier}
                                label="Email, matric number or staff ID"
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
                                error={errors.password}
                                announceError={false}
                                required
                            />
                            <SubmitButton processing={processing}>Sign in</SubmitButton>
                        </>
                    )}
                </Form>
                <Link className="mt-4 inline-block underline" href="/forgot-password">
                    Forgot your password?
                </Link>
            </section>
        </main>
    );
}
