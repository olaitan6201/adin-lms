import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ConnectionStatus } from './portal/ConnectionStatus';
import { PortalRail, type PortalBrand } from './portal/PortalRail';
import { PortalTopbar } from './portal/PortalTopbar';
import type { Destination } from './portal/SidebarNavigation';

type Shared = {
    signedIn: boolean;
    branding: PortalBrand;
    academicLinks?: Destination[];
    name?: string;
    audience?: string;
    portalIdentity?: {
        name: string;
        role: string
    } | null;
};

export function PortalLayout({ children }: { children: ReactNode }) {
    const { url, props, component } = usePage<Shared>();
    const path = url.split(/[?#]/)[0];
    const previous = useRef(path);
    const content = useRef<HTMLDivElement>(null);
    const close = useRef<HTMLButtonElement>(null);
    const navigated = useRef(false);
    const [open, setOpen] = useState(false);
    const bare = ['Auth/Login', 'Auth/ForgotPassword', 'Auth/ResetPassword'].includes(component);
    const dashboard = component === 'Insights/Dashboard';
    const name = props.portalIdentity?.name || (dashboard && props.name) || 'My account';
    const role = props.portalIdentity?.role || (dashboard && props.audience) || 'Academic workspace';
    const account = {
        name,
        role,
        initials: name
            .trim()
            .split(/\s+/)
            .slice(-2)
            .map(part => part[0])
            .join('')
            .toUpperCase(),
    };
    const rail = {
        branding: props.branding,
        signedIn: props.signedIn,
        academicLinks: props.academicLinks ?? [],
        path,
        account,
        onCurrentPage: () => setOpen(false),
    };
    const module = component.split('/').pop() ?? component;
    const title = dashboard
        ? 'Dashboard'
        : module === 'Home'
          ? 'Learning portal'
          : module.replace(/([a-z])([A-Z])/g, '$1 $2');

    useEffect(() => {
        if (previous.current === path) return;

        previous.current = path;
        navigated.current = true;
        setOpen(false);
        content.current?.focus({ preventScroll: true });
    }, [path]);
    useEffect(() => {
        const query = window.matchMedia('(min-width: 1024px)');
        const resize = () => {
            if (query.matches) setOpen(false);
        };

        query.addEventListener('change', resize);
        return () => query.removeEventListener('change', resize);
    }, []);

    const menu = (
        <Sheet
            open={open}
            onOpenChange={value => {
                if (value) navigated.current = false;

                setOpen(value);
            }}
        >
            <SheetTrigger className="portal-icon portal-menu-trigger" aria-label="Menu">
                <Menu size={20} />
            </SheetTrigger>
            <SheetContent
                side="left"
                showCloseButton={false}
                className="portal-mobile-rail"
                onOpenAutoFocus={event => {
                    event.preventDefault();
                    close.current?.focus();
                }}
                onCloseAutoFocus={event => {
                    if (navigated.current) {
                        event.preventDefault();
                        content.current?.focus({ preventScroll: true });
                    }
                }}
            >
                <SheetTitle className="sr-only">Portal menu</SheetTitle>
                <SheetDescription className="sr-only">{props.branding.institution}</SheetDescription>
                <PortalRail
                    {...rail}
                    close={
                        <SheetClose ref={close} className="portal-icon" aria-label="Close menu">
                            <X size={16} />
                        </SheetClose>
                    }
                />
            </SheetContent>
        </Sheet>
    );
    return (
        <div className={bare ? 'portal-shell portal-bare' : 'portal-shell'}>
            <a href="#portal-content" className="portal-skip">
                Skip to content
            </a>
            {!bare && (
                <aside className="portal-desktop-rail">
                    <PortalRail {...rail} />
                </aside>
            )}
            <div className="portal-shell-body">
                {!bare && (
                    <PortalTopbar
                        menu={menu}
                        branding={props.branding}
                        title={title}
                        signedIn={props.signedIn}
                        account={account}
                        academicLinks={rail.academicLinks}
                    />
                )}
                <ConnectionStatus />
                <div id="portal-content" tabIndex={-1} ref={content}>
                    {children}
                </div>
            </div>
        </div>
    );
}
