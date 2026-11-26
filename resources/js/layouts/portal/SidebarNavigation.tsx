import { Link } from '@inertiajs/react';
import { navigationGroups, type Destination } from './navigationGroups';

export { navigationGroups, type Destination } from './navigationGroups';

export function SidebarNavigation({
    signedIn,
    academicLinks,
    path,
    onCurrentPage,
}: {
    signedIn: boolean;
    academicLinks: Destination[];
    path: string;
    onCurrentPage: () => void;
}) {
    const groups = navigationGroups(signedIn, academicLinks);
    const active = groups
        .flatMap(({ links }) => links.map(({ href }) => href))
        .filter((href): href is string => !!href && (path === href || (href !== '/' && path.startsWith(`${href}/`))))
        .sort((a, b) => b.length - a.length)[0];

    return (
        <nav className="portal-navigation" aria-label="Primary">
            {groups
                .filter(group => group.links.some(link => link.href))
                .map(({ label, links }) => (
                    <div key={label}>
                        <p className="rail-section">{label}</p>
                        <ul className="mt-1 space-y-0.5">
                            {links.map(
                                ({ label: text, href, Icon }) =>
                                    href && (
                                        <li key={href}>
                                            <Link
                                                href={href}
                                                className={`rail-link${href === active ? ' rail-link-active' : ''}`}
                                                onClick={path === href ? onCurrentPage : undefined}
                                                aria-current={
                                                    href === active ? (path === href ? 'page' : 'location') : undefined
                                                }
                                            >
                                                <Icon size={16} aria-hidden="true" />
                                                <span>{text}</span>
                                            </Link>
                                        </li>
                                    ),
                            )}
                        </ul>
                    </div>
                ))}
        </nav>
    );
}
