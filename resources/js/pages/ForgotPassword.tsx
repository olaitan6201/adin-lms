import { Form, Head, Link } from '@inertiajs/react';

export default function ForgotPassword({ requested }: { requested: boolean }) {
    return (
        <main className="mx-auto max-w-md px-6 py-16">
            <Head title="Forgot password" />
            <h1 className="mb-2 text-3xl font-semibold">Forgot your password?</h1>
            <p className="mb-6">Enter the email address you use for Adin LMS.</p>
            {requested && <p className="mb-4" role="status">If your account is eligible, you’ll receive a password reset link by email.</p>}
            <Form action="/forgot-password" method="post" className="grid gap-4">
                {({ errors, processing }) => <>
                    <label>Email address<input className="block w-full border p-2" type="email" name="email" autoComplete="email" required /></label>
                    {errors.email && <p role="alert">{errors.email}</p>}
                    <button className="bg-teal-900 p-2 text-white" disabled={processing}>Send reset link</button>
                </>}
            </Form>
            <Link href="/login" className="mt-4 inline-block underline">Back to sign in</Link>
        </main>
    );
}
