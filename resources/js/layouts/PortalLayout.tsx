import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ConnectionStatus } from './ConnectionStatus';

type AcademicLink = {
    label: string;
    href: string;
};

export function PortalLayout({ children }: { children: ReactNode }) {
    const { url, props } = usePage<{
        signedIn: boolean;
        academicLinks?: AcademicLink[];
    }>();
    const path = url.split('?')[0];
    const previousPath = useRef(path);
    const content = useRef<HTMLDivElement>(null);
    const menuButton = useRef<HTMLButtonElement>(null);
    const [expanded, setExpanded] = useState(false);

    const brand = document.body.dataset;
    const links = props.signedIn
        ? [
              { label: 'Dashboard', href: brand.dashboard },
              { label: 'My courses', href: brand.courses },
              { label: 'Search courses', href: brand.search },
              ...(props.academicLinks ?? []),
              { label: 'Reports', href: brand.reports },
              { label: 'Inbox', href: brand.inbox },
              { label: 'Profile', href: brand.profile },
          ]
        : [
              { label: 'Portal home', href: '/' },
              { label: 'Sign in', href: '/login' },
          ];

    useEffect(() => {
        if (previousPath.current !== path) {
            content.current?.focus({ preventScroll: true });
            setExpanded(false);
            previousPath.current = path;
        }
    }, [path]);

    return (
        <>
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
                        <img src={brand.logoWhite ?? brand.logo} width="44" height="44" alt="" />
                        <span>
                            {brand.institution}
                            <small>Learning management system</small>
                        </span>
                    </Link>
                    <button
                        ref={menuButton}
                        type="button"
                        className="portal-menu"
                        aria-expanded={expanded}
                        aria-controls="portal-navigation"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? 'Close menu' : 'Menu'}
                    </button>
                </div>
                <div
                    className="portal-navband"
                    data-expanded={expanded}
                    onKeyDown={(event) => {
                        if (event.key === 'Escape' && expanded) {
                            setExpanded(false);
                            menuButton.current?.focus();
                        }
                    }}
                >
                    <nav id="portal-navigation" aria-label="Primary" className="portal-nav">
                        {links.map(
                            ({ label, href }) =>
                                href && (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setExpanded(false)}
                                        aria-current={path === href ? 'page' : undefined}
                                    >
                                        {label}
                                    </Link>
                                ),
                        )}
                        {props.signedIn && (
                            <Link className="portal-exit" href="/logout" method="post" as="button">
                                Sign out
                            </Link>
                        )}
                    </nav>
                </div>
            </header>
            <ConnectionStatus />
            <div id="portal-content" tabIndex={-1} ref={content}>
                {children}
            </div>
        </>
    );
}
