import { workspaceUrl } from '@/lib/workspaceUrl';
import { Link } from '@inertiajs/react';
import { Icon } from '@/components/icons/Icon';
import { Popover } from 'radix-ui';
import { roleKeys, roles, type RoleKey } from './navigation';
import { useWorkspaceShell } from './shellModel';

export function RoleSwitcher({
    role,
    compact = false,
    onNavigate,
}: {
    role: RoleKey;
    compact?: boolean;
    onNavigate?: () => void;
}) {
    const { identities } = useWorkspaceShell();
    const { name: person } = identities[role];
    const { label, short } = roles[role];
    return (
        <Popover.Root>
            <Popover.Trigger
                className={
                    compact
                        ? 'ml-1 flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-ink-100'
                        : 'portal-account ws-role-switch'
                }
                aria-label={`Switch fixture role: ${label}, ${person}`}
            >
                <span
                    className={
                        compact
                            ? 'grid size-8 place-items-center rounded-full bg-brand-100 text-[11px] font-semibold text-brand-800'
                            : 'portal-monogram'
                    }
                >
                    {compact
                        ? person
                              .split(' ')
                              .slice(-2)
                              .map(part => part[0])
                              .join('')
                        : short}
                </span>
                <span className={compact ? 'hidden text-left leading-tight lg:block' : 'portal-account-copy'}>
                    <strong className={compact ? 'block text-[12.5px] font-medium text-ink-800' : undefined}>
                        {person}
                    </strong>
                    <small className={compact ? 'block text-[11px] text-ink-400' : undefined}>{label}</small>
                </span>
                {!compact && <Icon name="chevronDown" className="size-4 shrink-0 text-ink-400" />}
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    align={compact ? 'end' : 'start'}
                    sideOffset={4}
                    collisionPadding={8}
                    aria-label="Fixture roles"
                    className="z-[60] w-60 overflow-hidden rounded-xl border border-ink-700 bg-ink-800 shadow-lift"
                >
                    {roleKeys.map(key => (
                        <Popover.Close asChild key={key}>
                            <Link
                                href={workspaceUrl(`${key}/${roles[key].home}`)}
                                onClick={onNavigate}
                                className={`flex items-start gap-2.5 px-3 py-2.5 hover:bg-white/5 ${key === role ? 'bg-white/5' : ''}`}
                            >
                                <span className="mt-0.5 grid size-7 place-items-center rounded-md bg-white/10 text-[9.5px] font-bold text-ink-200">
                                    {roles[key].short}
                                </span>
                                <span>
                                    <strong className="block text-[13px] font-medium text-white">
                                        {roles[key].label}
                                    </strong>
                                    <small className="block text-[11px] text-ink-300">{identities[key].name}</small>
                                </span>
                            </Link>
                        </Popover.Close>
                    ))}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
