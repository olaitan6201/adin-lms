import type { ReactNode } from 'react';
import { IdentityAside, IdentityMark } from './IdentityAside';

type AccountTaskProps = {
    context: string;
    title: string;
    introduction: string;
    children: ReactNode;
    recovery?: boolean;
};

export function AccountTask({ context, title, introduction, children, recovery = false }: AccountTaskProps) {
    return (
        <main className="auth-shell bg-canvas">
            <IdentityAside recovery={recovery} />
            <section className="flex min-w-0 flex-col justify-center px-5 py-10 sm:px-10 lg:px-14">
                <div className="mx-auto w-full max-w-[420px]">
                    <div className="mb-8 lg:hidden">
                        <IdentityMark compact />
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">{context}</p>
                    <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.02em] text-ink-900">{title}</h1>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-600">{introduction}</p>
                    <div className="mt-7 grid min-w-0 gap-4 [&_input]:rounded-lg [&_button[type=submit]]:w-full [&_label]:text-[11px] [&_label]:font-semibold [&_label]:uppercase [&_label]:tracking-[0.08em] [&_label]:text-ink-500">
                        {children}
                    </div>
                </div>
            </section>
        </main>
    );
}
