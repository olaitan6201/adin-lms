import { usePage } from '@inertiajs/react';

type IdentityBranding = {
    institution: string;
    logoWhite: string;
    logoFull: string;
};

export function IdentityAside({ recovery }: { recovery: boolean }) {
    const { branding } = usePage<{ branding: IdentityBranding }>().props;

    return (
        <aside className="auth-aside">
            <div className="auth-mark">
                <img
                    alt=""
                    src={branding.logoWhite || branding.logoFull}
                    width={48}
                    height={40}
                />
                <div>
                    <p>AdinOpen LMS</p>
                    <p>{branding.institution}</p>
                </div>
            </div>
            <div className="auth-identity-copy">
                <p>University account</p>
                <p>{recovery ? 'Recover access to your account.' : 'Your learning record, in one place.'}</p>
            </div>
        </aside>
    );
}
