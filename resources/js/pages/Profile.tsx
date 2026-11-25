import { Form, Head, Link } from '@inertiajs/react';
import { PortalField, SubmitButton } from '../components/PortalForm';

type ProfileProps = {
    profile: {
        full_name: string;
        email: string;
    };
};

export default function Profile({ profile }: ProfileProps) {
    return (
        <main className="mx-auto max-w-xl px-6 py-16">
            <Head title="My profile" />
            <Link className="underline" href="/courses">
                My courses
            </Link>
            <h1 className="my-4 text-3xl font-semibold">My profile</h1>
            <p className="mb-6 break-words">Sign-in email: {profile.email}</p>
            <Form action="/profile" method="patch" className="grid gap-3">
                {({ errors, processing, recentlySuccessful }) => (
                    <>
                        <PortalField
                            label="Full name"
                            name="full_name"
                            autoComplete="name"
                            defaultValue={profile.full_name}
                            required
                            maxLength={191}
                            error={errors.full_name}
                        />
                        <SubmitButton processing={processing}>Save profile</SubmitButton>
                        <p role="status">{recentlySuccessful ? 'Profile saved.' : ''}</p>
                    </>
                )}
            </Form>
        </main>
    );
}
