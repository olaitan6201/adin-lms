import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/icons/Icon';

export type Tone = 'emerald' | 'amber' | 'rose' | 'sky';
const colors: Record<Tone, string> = {
    emerald: 'border-brand-200 bg-brand-50 text-brand-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    rose: 'border-rose-200 bg-rose-50 text-rose-900',
    sky: 'border-sky-200 bg-sky-50 text-sky-900',
};

export function useWorkspaceToasts() {
    const [toasts, setToasts] = useState<{
        id: number;
        message: string;
        tone: Tone
    }[]>([]);
    const timers = useRef(new Set<number>());
    useEffect(() => {
        const pending = timers.current;
        return () => pending.forEach(timer => window.clearTimeout(timer));
    }, []);
    const notify = useCallback((message: string, tone: Tone = 'emerald') => {
        const id = window.setTimeout(() => {
            setToasts(current => current.filter(item => item.id !== id));
            timers.current.delete(id);
        }, 3800);
        timers.current.add(id);
        setToasts(current => [...current, { id, message, tone }]);
    }, []);

    return { toasts, notify };
}

export function WorkspaceToasts({ toasts }: Pick<ReturnType<typeof useWorkspaceToasts>, 'toasts'>) {
    return (
        <div
            role="status"
            aria-live="polite"
            className="pointer-events-none fixed right-5 bottom-5 z-[70] flex w-[min(92vw,380px)] flex-col gap-2"
        >
            {toasts.map(({ id, message, tone }) => {
                const icon = tone === 'amber' || tone === 'rose' ? 'alert' : 'check';
                return (
                    <div
                        key={id}
                        className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] shadow-lift motion-safe:animate-fade-up ${colors[tone]}`}
                    >
                        <Icon name={icon} className="mt-0.5 size-4 shrink-0" />
                        {message}
                    </div>
                );
            })}
        </div>
    );
}
