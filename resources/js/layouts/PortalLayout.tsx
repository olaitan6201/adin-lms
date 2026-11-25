import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ConnectionStatus } from './ConnectionStatus';
import { SidebarNavigation } from './SidebarNavigation';

type AcademicLink = {
    label: string;
    href: string;
};

export function PortalLayout({ children }: { children: ReactNode }) {
    const { url, props } = usePage<{
        signedIn: boolean;
        branding: { institution: string; logoWhite: string };
        academicLinks?: AcademicLink[];
    }>();
    const path = url.split(/[?#]/)[0];
    const previousPath = useRef(path);
    const content = useRef<HTMLDivElement>(null);
    const drawer = useRef<HTMLDialogElement>(null);
    const [expanded, setExpanded] = useState(false);

    const brand = props.branding;

    useEffect(() => {
        if (previousPath.current !== path) {
            drawer.current?.close();
            content.current?.focus({ preventScroll: true });
            setExpanded(false);
            previousPath.current = path;
        }
    }, [path]);

    useEffect(() => {
        const desktop = window.matchMedia('(min-width: 58rem)');
        const closeOnDesktop = () => {
            if (desktop.matches && drawer.current?.open) {
                drawer.current.close();
                content.current?.focus();
            }
        };
        desktop.addEventListener('change', closeOnDesktop);
        return () => desktop.removeEventListener('change', closeOnDesktop);
    }, []);

    const navigation = <SidebarNavigation signedIn={props.signedIn} academicLinks={props.academicLinks ?? []}
        path={path} close={() => drawer.current?.close()} />;

    return (
        <div className="portal-shell">
            <a href="#portal-content" className="portal-skip">
                Skip to content
            </a>
            <header className="portal-header">
                <div className="portal-bar">
                    <Link
                        href={props.signedIn ? '/dashboard' : '/'}
                        className="portal-brand"
                        aria-label={`${brand.institution} home`}
                    >
                        <img src={brand.logoWhite} width="44" height="44" alt="" />
                        <span>
                            {brand.institution}
                            <small>Learning management system</small>
                        </span>
                    </Link>
                    <button
                        type="button"
                        className="portal-menu"
                        aria-expanded={expanded}
                        aria-controls="portal-drawer"
                        aria-haspopup="dialog"
                        onClick={() => {
                            drawer.current?.showModal();
                            setExpanded(true);
                        }}
                    >
                        Menu
                    </button>
                </div>
                <div className="portal-sidebar">{navigation}</div>
            </header>
            <dialog id="portal-drawer" className="portal-drawer" aria-label="Portal menu" ref={drawer}
                onClose={() => setExpanded(false)}
                onClick={(event) => {
                    if (event.target === event.currentTarget && event.clientX >= event.currentTarget.getBoundingClientRect().right) {
                        event.currentTarget.close();
                    }
                }}>
                <div className="drawer-heading"><strong>{brand.institution}</strong>
                    <button type="button" className="portal-close" onClick={() => drawer.current?.close()}>Close menu</button>
                </div>
                {navigation}
            </dialog>
            <div className="portal-workspace">
                <ConnectionStatus />
                <div id="portal-content" tabIndex={-1} ref={content}>{children}</div>
            </div>
        </div>
    );
}
