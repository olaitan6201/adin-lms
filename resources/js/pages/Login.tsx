import { Form, Head } from '@inertiajs/react';

export default function Login() {
    return (
        <main className="mx-auto max-w-md px-6 py-16">
            <Head title="Sign in" />
            <h1 className="mb-6 text-3xl font-semibold">Sign in to Adin LMS</h1>
            <Form action="/login" method="post" resetOnError={['password']} className="grid gap-4">
                {({ errors, processing }) => (
                    <>
                        <label>Email<input className="block w-full border p-2" type="email" name="email" autoComplete="username" required /></label>
                        <label>Password<input className="block w-full border p-2" type="password" name="password" autoComplete="current-password" required /></label>
                        {(errors.email || errors.password) && <p role="alert">{errors.email || errors.password}</p>}
                        <button className="bg-teal-900 p-2 text-white" disabled={processing}>Sign in</button>
                    </>
                )}
            </Form>
        </main>
    );
}
