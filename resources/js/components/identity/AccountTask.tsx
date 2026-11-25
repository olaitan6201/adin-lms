import type { ReactNode } from 'react';

type AccountTaskProps = {
    context: string;
    title: string;
    introduction: string;
    children: ReactNode;
};

export function AccountTask({ context, title, introduction, children }: AccountTaskProps) {
    return (
        <main className="mx-auto grid w-full max-w-xl gap-6 px-4 py-8 sm:px-6 sm:py-12">
            <header className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{context}</p>
                <h1 className="break-words text-3xl font-semibold tracking-tight">{title}</h1>
                <p>{introduction}</p>
            </header>
            <div className="grid min-w-0 gap-4 rounded-lg border bg-card p-4 text-card-foreground sm:p-6">{children}</div>
        </main>
    );
}
