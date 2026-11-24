import { Form, Head, Link } from '@inertiajs/react';

export default function ResetPassword({ email, token }: { email: string; token: string }) {
    return (
        <main className="mx-auto max-w-md px-6 py-16">
            <Head title="Set your password"><meta name="referrer" content="no-referrer" /></Head>
            <h1 className="mb-2 text-3xl font-semibold">Set your password</h1>
            <p className="mb-6">Choose a password with at least 12 characters.</p>
            <Form action="/reset-password" method="post" className="grid gap-4" resetOnError={['password', 'password_confirmation']}>
                {({ errors, processing }) => <>
                    <input type="hidden" name="token" value={token} />
                    <label>Email address<input className="block w-full border p-2" type="email" name="email" defaultValue={email} autoComplete="email" required /></label>
                    <label>New password<input className="block w-full border p-2" name="password" type="password" autoComplete="new-password" minLength={12} required /></label>
                    <label>Confirm new password<input className="block w-full border p-2" name="password_confirmation" type="password" autoComplete="new-password" minLength={12} required /></label>
                    {Object.values(errors).map((message) => <p key={message} role="alert">{message}</p>)}
                    <button className="bg-teal-900 p-2 text-white" disabled={processing}>Set password</button>
                </>}
            </Form>
            <Link href="/forgot-password" className="mt-4 inline-block underline">Request a new link</Link>
        </main>
    );
}
