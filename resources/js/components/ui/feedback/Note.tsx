import type { ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';

export function Note({ children }: { children: ReactNode }) {
    return <div className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50/70 px-3.5 py-3 text-[13px] leading-relaxed text-sky-900"><Icon name="info" className="mt-0.5 size-4 shrink-0"/><span>{children}</span></div>;
}
