import type { ReactNode } from 'react';
import { IdentityAside } from './IdentityAside';

type AccountTaskProps = {
    context: string;
    title: string;
    introduction: string;
    children: ReactNode;
    recovery?: boolean;
};

export function AccountTask({ context, title, introduction, children, recovery = false }: AccountTaskProps) {
    return (
        <main className="auth-shell">
            <IdentityAside recovery={recovery} />
            <section className="auth-task" aria-labelledby="auth-title">
                <header className="auth-task-heading">
                    <p className="auth-context">{context}</p>
                    <h1 id="auth-title">{title}</h1>
                    <p>{introduction}</p>
                </header>
                <div className="auth-task-body">{children}</div>
            </section>
        </main>
    );
}
