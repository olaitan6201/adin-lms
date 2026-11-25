import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { ConnectionStatus } from './ConnectionStatus';

type AcademicLink = {
    label: string;
    href: string;
};

export function PortalLayout({ children }: { children: ReactNode }) {
    const { url, props } = usePage<{ academicLinks?: AcademicLink[] }>();
    const path = url.split('?')[0];
    const previousPath = useRef(path);
    const content = useRef<HTMLDivElement>(null);

    const brand = document.body.dataset;
    const links = [
        { label: 'Dashboard', href: brand.dashboard },
        { label: 'My courses', href: brand.courses },
        { label: 'Search courses', href: brand.search },
        ...(props.academicLinks ?? []),
        { label: 'Reports', href: brand.reports },
        { label: 'Inbox', href: brand.inbox },
        { label: 'Profile', href: brand.profile },
    ];

    useEffect(() => {
        if (previousPath.current !== path) {
            content.current?.focus({ preventScroll: true });
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
                        href="/"
                        className="portal-brand"
                        aria-label={`${brand.institution} home`}
                    >
                        <img src={brand.logo} width="44" height="44" alt="" />
                        <span>
                            {brand.institution}
                            <small>Learning portal</small>
                        </span>
                    </Link>
                    <nav aria-label="Primary" className="portal-nav">
                        {links.map(
                            ({ label, href }) =>
                                href && (
                                    <Link
                                        key={href}
                                        href={href}
                                        aria-current={path === href ? 'page' : undefined}
                                    >
                                        {label}
                                    </Link>
                                ),
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
