import { Link } from '@inertiajs/react';
import { Bell, SlidersHorizontal } from 'lucide-react';
import { Popover } from 'radix-ui';
import { useEffect, useState, type ReactNode } from 'react';
import type { Account, PortalBrand } from './PortalRail';
import { PortalSearch } from './PortalSearch';
import type { Destination } from './SidebarNavigation';

export function PortalTopbar({ menu, branding, title, signedIn, account, academicLinks }: {
    menu: ReactNode; branding: PortalBrand; title: string; signedIn: boolean; account: Account; academicLinks: Destination[];
}) {
    const routes = document.body.dataset;
    const [scale, setScale] = useState('md');
    useEffect(() => {
        document.documentElement.dataset.fontScale = scale;
        return () => { delete document.documentElement.dataset.fontScale; };
    }, [scale]);
    return <header className="portal-topbar">
        {menu}
        <div className="portal-heading">
            <span className="portal-institution portal-desktop-institution">{branding.institution}</span>
            <Link className="portal-institution portal-mobile-institution" href={signedIn ? routes.dashboard ?? '/dashboard' : '/'} aria-label={`${branding.institution} home`}>
                <img src={branding.logoWhite || branding.logoFull} alt="" height={16} width={18} />
                <span>{branding.institution}</span>
            </Link>
            <p>{title}</p>
        </div>
        <div className="portal-tools">
            {signedIn && <PortalSearch academicLinks={academicLinks} />}
            {signedIn && routes.inbox && <Link href={routes.inbox} className="portal-icon" aria-label="Notifications">
                <Bell size={20} aria-hidden="true" />
            </Link>}
            <Popover.Root>
                <Popover.Trigger className="portal-icon" aria-label="Accessibility options"><SlidersHorizontal size={20} /></Popover.Trigger>
                <Popover.Portal><Popover.Content align="end" sideOffset={8} collisionPadding={12} className="portal-access" aria-label="Accessibility options">
                    <strong>Text size</strong>
                    <div>{['Default', 'Large', 'Larger'].map((label, i) => {
                        const value = ['md', 'lg', 'xl'][i];
                        return <button type="button" key={value} aria-pressed={scale === value} onClick={() => setScale(value)}>{label}</button>;
                    })}</div>
                </Popover.Content></Popover.Portal>
            </Popover.Root>
            {signedIn && routes.profile && <Link href={routes.profile} className="portal-identity" aria-label="Open account profile">
                <span className="portal-avatar">{account.initials}</span>
                <span className="portal-account-copy"><strong>{account.name}</strong><small>{account.role}</small></span>
            </Link>}
        </div>
    </header>;
}
