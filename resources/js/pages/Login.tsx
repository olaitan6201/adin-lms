import { Form, Head, Link } from '@inertiajs/react';

export default function Login({ passwordReset }: { passwordReset: boolean }) {
    return (
        <main className="mx-auto max-w-md px-6 py-16">
            <Head title="Sign in" />
            <h1 className="mb-6 text-3xl font-semibold">Sign in to Adin LMS</h1>
            {passwordReset && <p role="status">Your password has been set. Sign in with your new password.</p>}
            <Form action="/login" method="post" resetOnError={['password']} className="grid gap-4">
                {({ errors, processing }) => (
                    <>
                        <label>Email, matric number or staff ID<input className="block w-full border p-2" name="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required /></label>
                        <label>Password<input className="block w-full border p-2" type="password" name="password" autoComplete="current-password" required /></label>
                        {(errors.email || errors.password) && <p role="alert">{errors.email || errors.password}</p>}
                        <button className="bg-teal-900 p-2 text-white" disabled={processing}>Sign in</button>
                    </>
                )}
            </Form>
            <Link className="mt-4 inline-block underline" href="/forgot-password">Forgot your password?</Link>
        </main>
    );
}
