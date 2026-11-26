import { Link } from '@inertiajs/react';
import { BookOpen, Building2, CalendarDays, ChartNoAxesCombined, ClipboardList, Home, Layers, LayoutDashboard, LogIn, Mail, Search, UserRound } from 'lucide-react';

export type Destination = { label: string; href: string };

export function navigationGroups(signedIn: boolean, academicLinks: Destination[]) {
    const routes = document.body.dataset;
    const calendar = academicLinks.find(link => link.href === '/calendar')?.href || routes.calendar;
    return signedIn ? [
        { label: 'Overview', links: [{ label: 'Dashboard', href: routes.dashboard, Icon: LayoutDashboard }] },
        { label: 'Learning', links: [
            { label: 'My courses', href: routes.courses, Icon: BookOpen },
            { label: 'Search courses', href: routes.search, Icon: Search },
        ] },
        { label: 'Academic', links: academicLinks.filter(link => link.href !== '/calendar').map(link => ({
            ...link, Icon: link.label === 'Organisation' ? Building2 : link.label === 'Examinations office' ? ClipboardList : Layers,
        })) },
        { label: 'Engagement', links: [
            { label: 'Inbox', href: routes.inbox, Icon: Mail },
            { label: 'Calendar', href: calendar, Icon: CalendarDays },
            { label: 'Reports', href: routes.reports, Icon: ChartNoAxesCombined },
        ] },
        { label: 'Personal', links: [{ label: 'Profile', href: routes.profile, Icon: UserRound }] },
    ] : [{ label: 'Portal', links: [{ label: 'Portal home', href: '/', Icon: Home }, { label: 'Sign in', href: '/login', Icon: LogIn }] }];
}

export function SidebarNavigation({ signedIn, academicLinks, path, onCurrentPage }: {
    signedIn: boolean; academicLinks: Destination[]; path: string; onCurrentPage: () => void;
}) {
    const groups = navigationGroups(signedIn, academicLinks);
    const active = groups.flatMap(({ links }) => links.map(({ href }) => href))
        .filter((href): href is string => !!href && (path === href || (href !== '/' && path.startsWith(`${href}/`))))
        .sort((a, b) => b.length - a.length)[0];

    return <nav className="portal-navigation" aria-label="Primary">
        {groups.filter(group => group.links.some(link => link.href)).map(({ label, links }) => <div key={label}>
            <p className="rail-section">{label}</p>
            <ul className="mt-1 space-y-0.5">
                {links.map(({ label: text, href, Icon }) => href && <li key={href}>
                    <Link href={href} className={`rail-link${href === active ? ' rail-link-active' : ''}`}
                        onClick={path === href ? onCurrentPage : undefined}
                        aria-current={href === active ? (path === href ? 'page' : 'location') : undefined}>
                        <Icon size={16} aria-hidden="true" /><span>{text}</span>
                    </Link>
                </li>)}
            </ul>
        </div>)}
    </nav>;
}
