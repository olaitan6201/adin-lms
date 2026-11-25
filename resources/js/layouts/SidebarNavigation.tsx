import { Link } from '@inertiajs/react';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

export type Destination = { label: string; href: string };

export function SidebarNavigation({ signedIn, academicLinks, path }: {
    signedIn: boolean; academicLinks: Destination[]; path: string;
}) {
    const routes = document.body.dataset;
    const groups = signedIn ? [
        { label: 'Workspace', links: [
            { label: 'Dashboard', href: routes.dashboard }, { label: 'My courses', href: routes.courses },
            { label: 'Search courses', href: routes.search },
        ] },
        { label: 'Academic services', links: [...academicLinks, { label: 'Reports', href: routes.reports }] },
        { label: 'Personal', links: [{ label: 'Inbox', href: routes.inbox }, { label: 'Profile', href: routes.profile }] },
    ] : [{ label: 'Portal', links: [{ label: 'Portal home', href: '/' }, { label: 'Sign in', href: '/login' }] }];
    const active = groups.flatMap(({ links }) => links.map(({ href }) => href))
        .filter((href): href is string => !!href && (path === href || (href !== '/' && path.startsWith(`${href}/`))))
        .sort((a, b) => b.length - a.length)[0];

    return <nav aria-label="Primary">
        {groups.map(({ label, links }) => <SidebarGroup key={label}>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {links.map(({ label: text, href }) => href && <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={href === active}>
                        <Link href={href} aria-current={href === active ? (path === href ? 'page' : 'location') : undefined}>{text}</Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>)}
                {signedIn && label === 'Personal' && <SidebarMenuItem><SidebarMenuButton asChild>
                    <Link href="/logout" method="post" as="button">Sign out</Link>
                </SidebarMenuButton></SidebarMenuItem>}
            </SidebarMenu>
        </SidebarGroup>)}
    </nav>;
}
