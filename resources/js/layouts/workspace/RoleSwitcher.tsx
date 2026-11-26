import { workspaceUrl } from '@/lib/workspaceUrl';
import { Link } from '@inertiajs/react';
import { Icon } from '@/components/workspace/Icon';
import { Popover } from 'radix-ui';
import { roleKeys, roles, type RoleKey } from './navigation';

export function RoleSwitcher({ role, compact = false, onNavigate }: {
    role: RoleKey; compact?: boolean; onNavigate?: () => void;
}) {
    const { person, label, short } = roles[role];
    return <Popover.Root>
        <Popover.Trigger className={compact ? 'portal-identity' : 'portal-account ws-role-switch'}
            aria-label={`Switch fixture role: ${label}, ${person}`}>
            <span className={compact ? 'portal-avatar' : 'portal-monogram'}>
                {compact ? person.split(' ').slice(-2).map(part => part[0]).join('') : short}
            </span>
            <span className="portal-account-copy"><strong>{person}</strong><small>{label}</small></span>
            {!compact && <Icon name="chevronDown" className="size-4 shrink-0" />}
        </Popover.Trigger>
        <Popover.Portal>
            <Popover.Content align={compact ? 'end' : 'start'} sideOffset={4} collisionPadding={8} aria-label="Fixture roles"
                className="z-[60] w-60 overflow-hidden rounded-xl border border-ink-700 bg-ink-800 shadow-lift">
                {roleKeys.map(key => <Popover.Close asChild key={key}>
                    <Link href={workspaceUrl(`${key}/${roles[key].home}`)} onClick={onNavigate}
                        className={`flex items-start gap-2.5 px-3 py-2.5 hover:bg-white/5 ${key === role ? 'bg-white/5' : ''}`}>
                        <span className="mt-0.5 grid size-7 place-items-center rounded-md bg-white/10 text-[9.5px] font-bold text-ink-200">{roles[key].short}</span>
                        <span><strong className="block text-[13px] font-medium text-white">{roles[key].label}</strong>
                            <small className="block text-[11px] text-ink-300">{roles[key].person}</small></span>
                    </Link>
                </Popover.Close>)}
            </Popover.Content>
        </Popover.Portal>
    </Popover.Root>;
}
