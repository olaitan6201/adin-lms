import { Head, Link } from '@inertiajs/react';
import { HistoryIcon, KeyIcon, LockIcon, PhoneIcon, ShieldIcon } from '@/components/icons';
import { type ReactNode } from 'react';
import { workspaceUrl } from '@/lib/workspaceUrl';
import type { WorkspaceShellModel } from '@/types/navigation/shell';
import { InstitutionMark } from '@/components/icons/InstitutionMark';

const identityCopy = {
    signin: {
        headline: 'One institutional record for learning, assessment and results.',
        description:
            'Course delivery, computer based testing, grading and reporting share the same identity and the same register, so a result is traceable to the assessment that produced it.',
        features: [
            [
                LockIcon,
                'One account per person',
                'Students, lecturers and officers sign in with the identifier issued by the Registrar.',
            ],
            [
                ShieldIcon,
                'Second factor for privileged roles',
                'Examinations, registry and ICT roles are challenged for a second factor at sign-in.',
            ],
            [
                HistoryIcon,
                'Every action is attributable',
                'Sign-in, role change and result release are written to the audit log.',
            ],
        ],
        footer: 'Prototype interface. No credential is transmitted, stored or verified by this screen.',
    },
    recover: {
        headline: 'Recover the account without asking anyone for your password.',
        description:
            'Nobody at the university, including the ICT Directorate, can read or reset a password on request. Recovery proves control of the registered channel and leaves a record of the attempt.',
        features: [
            [KeyIcon, 'The code is short lived', 'A recovery code expires after 15 minutes and can be used once.'],
            [
                PhoneIcon,
                'The code goes to the registered channel',
                'Students receive it on the registered phone; staff on the institutional relay.',
            ],
            [
                HistoryIcon,
                'The attempt is written to the audit log',
                'Recovery events are recorded alongside other security events.',
            ],
        ],
        footer: 'Prototype interface. No code is issued, sent or checked by this screen.',
    },
} as const;

export function AccessFrame({
    mode,
    brand,
    eyebrow,
    title,
    intro,
    children,
}: {
    mode: keyof typeof identityCopy;
    brand: WorkspaceShellModel['brand'];
    eyebrow: string;
    title: string;
    intro: string;
    children: ReactNode;
}) {
    const copy = identityCopy[mode];
    return (
        <>
            <a className="skip-link" href="#access-content">
                Skip to main content
            </a>
            <main id="access-content" tabIndex={-1} className="pr-4 pb-20 outline-none sm:pr-6 lg:pr-8">
                <div className="auth-shell mx-auto w-full max-w-[1560px]">
                    <Head title={eyebrow} />
                    <aside className="auth-aside">
                        <div>
                            <div className="flex items-center gap-3">
                                <InstitutionMark source={brand.crest} className="h-10 w-auto shrink-0" />
                                <div>
                                    <p className="text-[15px] font-semibold leading-tight text-white">{brand.name}</p>
                                    <p className="text-[11.5px] leading-tight text-ink-400">{brand.institution}</p>
                                </div>
                            </div>
                            <h1 className="mt-12 max-w-md text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-white">
                                {copy.headline}
                            </h1>
                            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-ink-400">{copy.description}</p>
                            <ul className="mt-10 space-y-4">
                                {copy.features.map(([FeatureIcon, label, detail]) => (
                                    <li key={label} className="flex gap-3">
                                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-300">
                                            <FeatureIcon className="size-4" />
                                        </span>
                                        <span>
                                            <span className="block text-[13.5px] font-medium text-white">{label}</span>
                                            <span className="mt-0.5 block max-w-sm text-[12.5px] leading-relaxed text-ink-400">
                                                {detail}
                                            </span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <p className="text-[11.5px] leading-relaxed text-ink-500">{copy.footer}</p>
                    </aside>
                    <section className="flex w-full flex-col justify-center px-5 py-10 sm:px-10 lg:px-14">
                        <div className="mx-auto w-full max-w-[420px]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">
                                {eyebrow}
                            </p>
                            <h2 className="mt-1.5 text-[24px] font-semibold tracking-[-0.02em] text-ink-900">
                                {title}
                            </h2>
                            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-500">{intro}</p>
                            {children}
                            <div className="mt-8 border-t border-ink-100 pt-5">
                                <Link
                                    className="text-[12.5px] font-medium text-ink-600 transition-colors hover:text-ink-900"
                                    href={workspaceUrl(mode === 'signin' ? 'admin/overview' : 'auth/signin')}
                                >
                                    {mode === 'signin' ? 'Return to the prototype dashboard' : 'Back to sign in'}
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
