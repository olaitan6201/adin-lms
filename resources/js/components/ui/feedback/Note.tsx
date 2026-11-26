import type { ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';

export function Note({ children, amber = false }: { children: ReactNode; amber?: boolean }) {
    const tone = amber ? 'border-amber-200 bg-amber-50/70 text-amber-900' : 'border-sky-200 bg-sky-50/70 text-sky-900';

    return (
        <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed ${tone}`}>
            <Icon name={amber ? 'alert' : 'info'} className="mt-0.5 size-4 shrink-0" />
            <span>{children}</span>
        </div>
    );
}
