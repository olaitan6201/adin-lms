import { workspaceUrl } from '@/lib/workspaceUrl';
import { Link } from '@inertiajs/react';
import { Icon } from '@/components/icons/Icon';
import { Popover } from 'radix-ui';
import { useEffect, useState } from 'react';
import type { RoleKey } from './navigation';
import { useWorkspaceOverlays } from './WorkspaceOverlays';

const textSizes = [
    { value: 'md', label: 'Default' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Larger' },
] as const;

export function AccessibilityOptions({ role, settings }: { role?: RoleKey; settings?: string }) {
    const { notify } = useWorkspaceOverlays();
    const settingsHref = role ? workspaceUrl(`${role}/settings/notifications`) : settings;
    const [scale, setScale] = useState(() => {
        try {
            return localStorage.getItem('workspace-text-size') || 'md';
        } catch {
            return 'md';
        }
    });
    useEffect(() => {
        document.documentElement.dataset.fontScale = scale;
        try {
            localStorage.setItem('workspace-text-size', scale);
        } catch {
            /* Storage is optional. */
        }

        return () => {
            delete document.documentElement.dataset.fontScale;
        };
    }, [scale]);

    function selectSize(size: (typeof textSizes)[number]) {
        setScale(size.value);
        notify(`Text size set to ${size.label.toLowerCase()}`);
    }

    return (
        <Popover.Root>
            <Popover.Trigger className="btn btn-ghost btn-sm" aria-label="Accessibility options">
                <Icon name="sliders" className="size-5" />
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    align="end"
                    sideOffset={8}
                    collisionPadding={8}
                    className="portal-access w-64"
                    aria-label="Accessibility options"
                >
                    <strong>Text size</strong>
                    <div>
                        {textSizes.map(size => (
                            <button
                                type="button"
                                key={size.value}
                                className="flex-1"
                                onClick={() => selectSize(size)}
                                aria-pressed={scale === size.value}
                            >
                                {size.label}
                            </button>
                        ))}
                    </div>
                    <p className="mt-3 text-[11px] leading-relaxed text-ink-500">
                        Keyboard: Ctrl K opens search, Escape closes panels, focus rings stay visible for keyboard
                        users.
                    </p>
                    {settingsHref && (
                        <Popover.Close asChild>
                            <Link
                                href={settingsHref}
                                className="mt-2 block rounded-lg border border-ink-200 px-2 py-1.5 text-center text-[11px] font-medium hover:bg-ink-50"
                            >
                                <Icon name="bell" className="mr-1 inline size-3.5" />
                                Notification settings
                            </Link>
                        </Popover.Close>
                    )}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
