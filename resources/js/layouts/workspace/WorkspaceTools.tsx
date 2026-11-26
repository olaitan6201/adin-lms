import { workspaceUrl } from '@/lib/workspaceUrl';
import { Link } from '@inertiajs/react';
import { Icon } from '@/components/icons/Icon';
import { Popover } from 'radix-ui';
import { useEffect, useState } from 'react';
import type { RoleKey } from './navigation';
import { useWorkspaceShell, type ShellNotice } from './shellModel';

const noticeColors: Record<ShellNotice['tone'], string> = {
    info: 'bg-sky-500', warning: 'bg-amber-500', success: 'bg-brand-500', danger: 'bg-rose-500',
};

export function Notifications({ notify }: { notify: (message: string) => void }) {
    const { notices } = useWorkspaceShell();
    const attention = notices.filter(notice => notice.needsAttention).length;
    return <Popover.Root>
        <Popover.Trigger className="btn btn-ghost btn-sm relative" aria-label="Notifications"><Icon name="bell" className="size-5" />
            {attention > 0 && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#f43f5e] ring-2 ring-white" />}
        </Popover.Trigger>
        <Popover.Portal><Popover.Content align="end" sideOffset={8} collisionPadding={8} aria-label="Notifications"
            className="z-50 w-[min(92vw,360px)] overflow-hidden rounded-xl border border-ink-100 bg-white shadow-lift">
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                <strong className="text-[13px] font-semibold">Notifications</strong><small className="text-[11px] text-ink-500">{attention} need attention</small>
            </div>
            <ul data-scroll className="max-h-[min(340px,52dvh)] divide-y divide-ink-100 overflow-auto">
                {notices.map(({ id, title, meta, time, tone }) => <li key={id} className="flex gap-3 px-4 py-3 hover:bg-ink-50">
                    <span className={`mt-1 size-2 shrink-0 rounded-full ${noticeColors[tone]}`} />
                    <span><strong className="block text-[13px] font-medium">{title}</strong>
                        <span className="mt-0.5 block text-xs text-ink-500">{meta}</span><small className="mt-1 block text-[11px] text-ink-500">{time}</small></span>
                </li>)}
                {!notices.length && <li className="px-4 py-3 text-xs text-ink-500">No notifications.</li>}
            </ul>
            <div className="border-t border-ink-100 bg-ink-50/60 px-4 py-2.5">
                <Popover.Close className="text-[12.5px] font-medium text-brand-700 hover:underline" onClick={() => notify('Notification centre opened')}>
                    Open notification centre
                </Popover.Close>
            </div>
        </Popover.Content></Popover.Portal>
    </Popover.Root>;
}

export function AccessibilityOptions({ role }: { role: RoleKey }) {
    const [scale, setScale] = useState(() => {
        try { return localStorage.getItem('workspace-text-size') || 'md'; }
        catch { return 'md'; }
    });
    useEffect(() => {
        document.documentElement.dataset.fontScale = scale;
        try { localStorage.setItem('workspace-text-size', scale); } catch { /* Storage is optional. */ }
        return () => { delete document.documentElement.dataset.fontScale; };
    }, [scale]);
    return <Popover.Root>
        <Popover.Trigger className="btn btn-ghost btn-sm" aria-label="Accessibility options"><Icon name="sliders" className="size-5" /></Popover.Trigger>
        <Popover.Portal><Popover.Content align="end" sideOffset={8} collisionPadding={8} className="portal-access w-64" aria-label="Accessibility options">
            <strong>Text size</strong>
            <div>{['md', 'lg', 'xl'].map((size, i) => <button type="button" key={size} className="flex-1" onClick={() => setScale(size)}
                aria-pressed={scale === size}>{['Default', 'Large', 'Larger'][i]}</button>)}</div>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-500">Keyboard: Ctrl K opens search, Escape closes panels, focus rings stay visible for keyboard users.</p>
            <Popover.Close asChild><Link href={workspaceUrl(`${role}/settings/notifications`)}
                className="mt-2 block rounded-lg border border-ink-200 px-2 py-1.5 text-center text-[11px] font-medium hover:bg-ink-50">
                <Icon name="bell" className="mr-1 inline size-3.5" /> Notification settings
            </Link></Popover.Close>
        </Popover.Content></Popover.Portal>
    </Popover.Root>;
}
