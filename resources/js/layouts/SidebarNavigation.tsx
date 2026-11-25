import { Link } from '@inertiajs/react';

type Destination = { label: string; href: string };
type Item = { label: string; href?: string; icon: string };
type Group = { label: string; items: Item[]; account?: boolean };

const icons = {
    dashboard: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    courses: 'M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1zm0 0v14',
    search: 'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0zm-2 5 6 6',
    reports: 'M3 3v17h18 M7 16v-4m5 4V8m5 8V5',
    inbox: 'M3 6h18v13H3z M3 7l9 7 9-7',
    profile: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M4 21a8 8 0 0 1 16 0',
    office: 'M3 8l9-5 9 5H3zm2 12h14 M7 10v7m5-7v7m5-7v7',
    exit: 'M10 4H4v16h6m-2-8h13m-5-5 5 5-5 5',
};

function Icon({ path }: { path: string }) {
    return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>;
}

export function SidebarNavigation({ signedIn, academicLinks, path, close }: {
    signedIn: boolean; academicLinks: Destination[]; path: string; close: () => void;
}) {
    const brand = document.body.dataset;
    const groups: Group[] = signedIn ? [
        { label: 'Workspace', items: [
            { label: 'Dashboard', href: brand.dashboard, icon: icons.dashboard },
            { label: 'My courses', href: brand.courses, icon: icons.courses },
            { label: 'Search courses', href: brand.search, icon: icons.search },
        ] },
        { label: 'Academic services', items: [
            ...academicLinks.map((link) => ({ ...link, icon: icons.office })),
            { label: 'Reports', href: brand.reports, icon: icons.reports },
        ] },
        { label: 'Personal', account: true, items: [
            { label: 'Inbox', href: brand.inbox, icon: icons.inbox },
            { label: 'Profile', href: brand.profile, icon: icons.profile },
        ] },
    ] : [{ label: 'Portal', items: [
        { label: 'Portal home', href: '/', icon: icons.dashboard },
        { label: 'Sign in', href: '/login', icon: icons.profile },
    ] }];
    const active = groups.flatMap((group) => group.items).map((item) => item.href)
        .filter((href): href is string => !!href && (path === href || (href !== '/' && path.startsWith(`${href}/`))))
        .sort((a, b) => b.length - a.length)[0];

    return <nav aria-label="Primary" className="portal-nav">
        {groups.map((group) => <section key={group.label} className={group.account ? 'nav-group nav-account' : 'nav-group'}>
            <h2 className="nav-caption">{group.label}</h2>
            {group.items.map(({ label, href, icon }) => href && <Link key={href} href={href} onClick={close}
                aria-current={href === active ? (path === href ? 'page' : 'location') : undefined}>
                <Icon path={icon} />{label}
            </Link>)}
            {group.account && <Link className="portal-exit" href="/logout" method="post" as="button">
                <Icon path={icons.exit} />Sign out
            </Link>}
        </section>)}
    </nav>;
}
