import type { ReactNode } from 'react';

type AccountTaskProps = {
    context: string;
    title: string;
    introduction: string;
    children: ReactNode;
};

export function AccountTask({ context, title, introduction, children }: AccountTaskProps) {
    return (
        <main className="portal-page portal-entry">
            <header className="entry-intro">
                <p className="portal-kicker">{context}</p>
                <h1 className="portal-title">{title}</h1>
                <p>{introduction}</p>
            </header>
            <div className="portal-panel desk-shelf entry-form grid gap-4">{children}</div>
        </main>
    );
}
