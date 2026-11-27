import { Icon } from '@/components/icons/Icon';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { Link } from '@inertiajs/react';
import { groupsFor, type RoleKey } from '../workspace/navigation';
import { useWorkspaceShell } from '../workspace/shellModel';

export function SidebarNavigation({ path, role, screen, onNavigate }: {
    path: string;
    role?: RoleKey;
    screen?: string;
    onNavigate?: () => void;
}) {
    const { live } = useWorkspaceShell();
    const activeHref = live?.groups
        .flatMap(group => group.links)
        .map(link => link.href)
        .filter(href => href === path || (href !== '/' && path.startsWith(`${href}/`)))
        .sort((a, b) => b.length - a.length)[0];
    const fixtureGroups = role ? groupsFor(role) : null;
    const groups = fixtureGroups
        ? fixtureGroups.map(({ group, links }) => ({
            label: group,
            links: links.map(({ key, label, icon }) => ({
                href: workspaceUrl(key),
                label,
                mark: <Icon name={icon} className="size-4 shrink-0" />,
                current: key === screen ? 'page' as const : undefined,
            })),
        }))
        : (live?.groups ?? []).map(({ label, links }) => ({
            label,
            links: links.map(({ href, label, Icon: Mark }) => ({
                href,
                label,
                mark: <Mark className="size-4 shrink-0" aria-hidden="true" />,
                current: href === activeHref ? (path === href ? 'page' as const : 'location' as const) : undefined,
            })),
        }));
    const visibleGroups = groups.filter(group => group.links.length);

    return (
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4" data-scroll aria-label={role ? 'Module navigation' : 'Primary'}>
            {visibleGroups.map(({ label, links }) => (
                <div className="mt-4" key={label}>
                    <p className="rail-section">{label}</p>
                    <ul className="mt-1 space-y-0.5">
                        {links.map(({ href, mark, label, current }) => (
                            <li key={href}>
                                <Link
                                    href={href}
                                    onClick={onNavigate}
                                    aria-current={current}
                                    className={`rail-link ${current ? 'rail-link-active' : ''}`}
                                >
                                    {mark}
                                    <span className="truncate">{label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
    );
}
