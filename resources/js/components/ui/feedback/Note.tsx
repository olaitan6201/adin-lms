import type { ReactNode } from 'react';

export function Note({ children }: { children: ReactNode }) {
    return <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">{children}</p>;
}
