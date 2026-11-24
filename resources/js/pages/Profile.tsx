import { Form, Head, Link } from '@inertiajs/react';

type ProfileProps = { profile: { full_name: string; email: string } };

export default function Profile({ profile }: ProfileProps) {
    return (
        <main className="mx-auto max-w-xl px-6 py-16">
            <Head title="My profile" />
            <Link className="underline" href="/courses">My courses</Link>
            <h1 className="my-4 text-3xl font-semibold">My profile</h1>
            <p className="mb-6 break-words">Sign-in email: {profile.email}</p>
            <Form action="/profile" method="patch" className="grid gap-3">
                {({ errors, processing, recentlySuccessful }) => (
                    <>
                        <label htmlFor="full_name">Full name</label>
                        <input id="full_name" name="full_name" autoComplete="name" defaultValue={profile.full_name}
                            className="border p-2" required maxLength={191} aria-invalid={Boolean(errors.full_name)}
                            aria-describedby={errors.full_name ? 'name-error' : undefined} />
                        {errors.full_name && <p role="alert" id="name-error">{errors.full_name}</p>}
                        <button className="bg-teal-900 p-2 text-white" disabled={processing}>Save profile</button>
                        <p role="status">{recentlySuccessful ? 'Profile saved.' : ''}</p>
                    </>
                )}
            </Form>
        </main>
    );
}
