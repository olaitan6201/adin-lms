import { Form, Head, Link } from '@inertiajs/react';
import { useRef } from 'react';
import { PortalField, SubmitButton } from '../components/PortalForm';

interface LoginProps {
    passwordReset: boolean;
    institutionSignIn: string | null;
}

export default function Login({ passwordReset, institutionSignIn }: LoginProps) {
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
                    action="/login"
                    method="post"
                    resetOnError={['password']}
                    className="grid gap-4"
                    onError={(errors) => {
                        const firstInvalid = errors.email ? identifier : password;
                        requestAnimationFrame(() => firstInvalid.current?.focus());
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
                                required
                            />
                            <PortalField
                                ref={password}
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
            </section>
        </main>
    );
}
