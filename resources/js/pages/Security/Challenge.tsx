import { Form, Head, Link } from '@inertiajs/react';

export default function Challenge() {
    return (
        <main className="mx-auto max-w-md px-6 py-16">
            <Head title="Verify your sign-in" />
            <h1 className="mb-4 text-3xl font-semibold">Verify your sign-in</h1>
            <p id="code-help">Enter the six-digit code from your authenticator. If this is your first sign-in, ask ICT for a setup key and add it to your authenticator first.</p>
            <Form action="/security/challenge" method="post" resetOnError={['code']} className="my-6 grid gap-4">
                {({ errors, processing }) => <>
                    <label>Authenticator code<input name="code" className="block w-full border p-2" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoComplete="one-time-code" aria-describedby="code-help" aria-invalid={!!errors.code} /></label>
                    {errors.code && <p role="alert">{errors.code}</p>}
                    <button className="bg-teal-900 p-2 text-white" disabled={processing}>Verify code</button>
                </>}
            </Form>
            <Link href="/logout" method="post" as="button" className="underline">Sign out</Link>
        </main>
    );
}
