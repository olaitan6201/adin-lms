import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export function PortalLayout({ children }: { children: ReactNode }) {
    const { url } = usePage();
    const path = url.split('?')[0];
    const previousPath = useRef(path);
    const content = useRef<HTMLDivElement>(null);
    const [notice, setNotice] = useState(navigator.onLine ? '' : 'offline');
    const brand = document.body.dataset;
    const links = [
        { label: 'My courses', href: brand.courses },
        { label: 'Search courses', href: brand.search },
        { label: 'Profile', href: brand.profile },
    ];

    useEffect(() => {
        if (previousPath.current !== path) {
            content.current?.focus({ preventScroll: true });
            previousPath.current = path;
        }
    }, [path]);

    useEffect(() => {
        const disconnected = () => setNotice('offline');
        const reconnected = () => setNotice('reconnected');
        window.addEventListener('offline', disconnected);
        window.addEventListener('online', reconnected);
        return () => {
            window.removeEventListener('offline', disconnected);
            window.removeEventListener('online', reconnected);
        };
    }, []);

    return <>
        <a href="#portal-content" className="portal-skip">Skip to content</a>
        <header className="portal-header">
            <div className="portal-bar">
                <Link href="/" className="portal-brand" aria-label={`${brand.institution} home`}>
                    <img src={brand.logo} width="44" height="44" alt="" />
                    <span>{brand.institution}<small>Learning portal</small></span>
                </Link>
                <nav aria-label="Primary" className="portal-nav">
                    {links.map(({ label, href }) => href && <Link key={href} href={href}
                        aria-current={path === href ? 'page' : undefined}>{label}</Link>)}
                </nav>
            </div>
        </header>
        <div role="status" className="portal-status">{notice === 'offline'
            ? 'You are offline. Keep this page open. Changes and submissions need a connection.'
            : notice === 'reconnected' && 'Connection restored. Check your last save or submission before trying again.'}</div>
        <div id="portal-content" tabIndex={-1} ref={content}>{children}</div>
    </>;
}
