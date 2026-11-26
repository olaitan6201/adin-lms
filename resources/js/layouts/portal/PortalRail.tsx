import { Link } from '@inertiajs/react';
import { ChevronRight, LogOut, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { InstallPortal } from './InstallPortal';
import { SidebarNavigation, type Destination } from './SidebarNavigation';

export type PortalBrand = {
    institution: string;
    logoFull: string;
    logoWhite: string
};
export type Account = {
    name: string;
    role: string;
    initials: string
};

export function PortalRail({
    branding,
    signedIn,
    account,
    academicLinks,
    path,
    close,
    onCurrentPage,
}: {
    branding: PortalBrand;
    signedIn: boolean;
    account: Account;
    academicLinks: Destination[];
    path: string;
    close?: ReactNode;
    onCurrentPage: () => void;
}) {
    const routes = document.body.dataset;
    return (
        <>
            <div className="portal-brand-row">
                <Link
                    href={signedIn ? (routes.dashboard ?? '/dashboard') : '/'}
                    className="portal-brand"
                    aria-label={`${branding.institution} home`}
                >
                    <img src={branding.logoWhite || branding.logoFull} width="42" height="36" alt="" />
                    <span>
                        <strong>AdinOpen LMS</strong>
                        <small>{branding.institution}</small>
                    </span>
                </Link>
                {close}
            </div>
            {signedIn && (
                <Link href={routes.profile ?? '/profile'} className="portal-account">
                    <span className="portal-monogram">{account.initials}</span>
                    <span className="portal-account-copy">
                        <strong>{account.name}</strong>
                        <small>{account.role}</small>
                    </span>
                    <ChevronRight size={16} aria-hidden="true" />
                </Link>
            )}
            <SidebarNavigation {...{ signedIn, academicLinks, path, onCurrentPage }} />
            {signedIn && (
                <footer className="portal-rail-footer">
                    <div>
                        <ShieldCheck size={16} aria-hidden="true" />
                        <span>
                            Protected session<small>MFA enforced for privileged roles</small>
                        </span>
                    </div>
                    <InstallPortal />
                    <Link href="/logout" as="button" method="post" aria-label="Sign out">
                        <LogOut size={16} aria-hidden="true" />
                        Sign out of this session
                    </Link>
                </footer>
            )}
        </>
    );
}
