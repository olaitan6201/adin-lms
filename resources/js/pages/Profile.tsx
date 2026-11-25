import { Form, Head, Link } from '@inertiajs/react';
import { PortalField, SubmitButton } from '../components/PortalForm';
import { AccountTask } from '../components/identity/AccountTask';

type ProfileProps = {
    profile: {
        full_name: string;
        email: string;
    };
};

export default function Profile({ profile }: ProfileProps) {
    return (
        <AccountTask
            context="My account"
            title="My profile"
            introduction="Update the name shown on your learning portal profile."
        >
            <Head title="My profile" />
            <dl className="border-b border-[var(--portal-line)] pb-4">
                <dt className="desk-note">Sign-in email</dt>
                <dd className="break-all font-semibold">{profile.email}</dd>
            </dl>
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
                        <p className="empty:hidden" role="status">
                            {recentlySuccessful ? 'Profile saved.' : ''}
                        </p>
                    </>
                )}
            </Form>
            <Link className="desk-link" href="/courses">
                My courses
            </Link>
        </AccountTask>
    );
}
