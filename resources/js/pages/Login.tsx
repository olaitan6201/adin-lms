import { Button } from '@/components/ui/button';
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
        <main className="mx-auto grid w-full max-w-xl gap-6 px-4 py-8 sm:px-6 sm:py-12">
            <Head title="Sign in" />
            <header className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Learning portal</p>
                <h1 className="break-words text-3xl font-semibold tracking-tight">Sign in</h1>
                <p>Use your institutional account to open your academic workspace.</p>
            </header>
            <section aria-label="Account details" className="min-w-0 rounded-lg border bg-card p-4 text-card-foreground sm:p-6">
                {institutionSignIn && (
                    <p className="mb-5">
                        <Button asChild className="h-auto min-h-9 max-w-full whitespace-normal">
                            <a href={institutionSignIn}>
                                Continue with institutional sign-in
                            </a>
                        </Button>
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
                        // Publish the description before moving focus, then clear the previous field.
                        requestAnimationFrame(() => requestAnimationFrame(() => {
                            firstInvalid.current?.focus();
                            form.current?.reset('password');
                        }));
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
