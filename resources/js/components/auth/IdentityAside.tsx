import { History, KeyRound, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';

const signIn = [
    [LockKeyhole, 'One account per person', 'Use your matric number, staff ID or institutional email address.'],
    [
        ShieldCheck,
        'Second factor for privileged roles',
        'When prompted, confirm your sign-in with your authenticator app.',
    ],
    [
        History,
        'A record of sign-in activity',
        'Password checks and authenticator activity are recorded in sign-in history.',
    ],
] as const;

const recover = [
    [Mail, 'Use your registered email', 'Request a link using the email address associated with your account.'],
    [KeyRound, 'Choose a new password', 'Follow the link from your inbox to set your password.'],
    [ShieldCheck, 'Keep your account private', 'Never share your password or reset link with another person.'],
] as const;

export function IdentityMark({ compact = false }: { compact?: boolean }) {
    const { branding } = usePage<{ branding: { institution: string; logoWhite: string; logoFull: string } }>().props;
    return (
        <Link href="/" aria-label={`${branding.institution} home`} className="inline-flex items-center gap-3">
            <img alt="" src={branding.logoWhite || branding.logoFull} className="h-10 w-12 shrink-0 object-contain" />
            <div>
                <p className="text-[15px] font-semibold leading-tight">AdinOpen LMS</p>
                <p className={compact ? 'text-xs text-ink-600' : 'text-xs text-ink-300'}>{branding.institution}</p>
            </div>
        </Link>
    );
}

export function IdentityAside({ recovery }: { recovery: boolean }) {
    return (
        <aside className="auth-aside">
            <div>
                <IdentityMark />
                <p className="mt-12 max-w-md text-[30px] font-semibold leading-[1.15] tracking-[-0.02em]">
                    {recovery
                        ? 'Recover your account without sharing your password.'
                        : 'One institutional record for learning, assessment and results.'}
                </p>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-300">
                    {recovery
                        ? 'Use the email address on your university account to request a password reset.'
                        : 'Course delivery, computer based testing, grading and reporting share the same identity and the same register, so a result is traceable to the assessment that produced it.'}
                </p>
                <ul className="mt-10 space-y-4">
                    {(recovery ? recover : signIn).map(([Icon, title, text]) => (
                        <li className="flex gap-3" key={title}>
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-300">
                                <Icon aria-hidden="true" size={16} />
                            </span>
                            <span>
                                <strong className="block text-[13.5px] font-medium">{title}</strong>
                                <span className="mt-0.5 block max-w-sm text-[12.5px] leading-relaxed text-ink-300">
                                    {text}
                                </span>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
