import { AlertIcon, CheckIcon, InfoIcon } from '@/components/icons';
import { useEffect, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';

export function AccessField({
    label,
    hint,
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    hint?: string;
}) {
    const id = useId();
    return (
        <label className="block">
            <span className="label">{label}</span>
            <input {...props} className={`input mt-1.5 w-full ${className}`} aria-describedby={hint ? id : undefined} />
            {hint && (
                <span id={id} className="hint">
                    {hint}
                </span>
            )}
        </label>
    );
}

export function AccessNote({ warning = false, children }: {
    warning?: boolean;
    children: ReactNode;
}) {
    const NoteIcon = warning ? AlertIcon : InfoIcon;
    return (
        <div
            className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed ${
                warning ? 'border-amber-200 bg-amber-50/70 text-amber-900' : 'border-sky-200 bg-sky-50/70 text-sky-900'
            }`}
        >
            <NoteIcon className="mt-0.5 size-4 shrink-0" />
            <span>{children}</span>
        </div>
    );
}

export function useAccessNotice() {
    const [notice, setNotice] = useState<{ text: string } | null>(null);
    useEffect(() => {
        if (!notice) {
            return;
        }

        const timer = window.setTimeout(() => setNotice(null), 3800);
        return () => window.clearTimeout(timer);
    }, [notice]);
    const feedback = notice && (
        <div
            role="status"
            className="fixed bottom-4 right-4 z-[70] flex max-w-sm items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-3 text-[13px] text-brand-900 shadow-lift"
        >
            <CheckIcon className="size-4 shrink-0" />
            {notice.text}
        </div>
    );
    return { notify: (text: string) => setNotice({ text }), feedback };
}
