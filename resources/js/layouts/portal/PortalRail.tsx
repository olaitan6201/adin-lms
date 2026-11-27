import { workspaceUrl } from '@/lib/workspaceUrl';
import { Link } from '@inertiajs/react';
import { Icon } from '@/components/icons/Icon';
import type { ReactNode } from 'react';
import { InstallPortal } from './InstallPortal';
import { SidebarNavigation } from './SidebarNavigation';
import { roles, type RoleKey } from '../workspace/navigation';
import { RoleSwitcher } from '../workspace/RoleSwitcher';
import { useWorkspaceShell } from '../workspace/shellModel';
import { InstitutionMark } from '@/components/icons/InstitutionMark';

export function PortalRail({
    path,
    role,
    screen,
    close,
    onNavigate,
}: {
    path: string;
    role?: RoleKey;
    screen?: string;
    close?: ReactNode;
    onNavigate?: () => void;
}) {
    const { brand, live } = useWorkspaceShell();
    const home = role ? workspaceUrl(`${role}/${roles[role].home}`) : live?.home ?? '/portal';

    return (
        <>
            <div className="portal-brand-row">
                <Link href={home} className="portal-brand" onClick={onNavigate}>
                    <InstitutionMark source={brand.crest} className="h-9 w-auto shrink-0" />
                    <span>
                        <strong>{brand.name}</strong>
                        <small>{brand.institution}</small>
                    </span>
                </Link>
                {close}
            </div>
            {role && <RoleSwitcher role={role} onNavigate={onNavigate} />}
            <SidebarNavigation
                path={path}
                role={role}
                screen={screen}
                onNavigate={onNavigate}
            />
            {live?.signedIn && (
                <footer className="portal-rail-footer">
                    <InstallPortal />
                    <Link href="/logout" method="post" as="button">
                        <Icon name="logout" className="size-4 shrink-0" />
                        Sign out
                    </Link>
                </footer>
            )}
            {role && (
                <footer className="portal-rail-footer">
                    <div>
                        <Icon name="info" className="size-4 shrink-0" />
                        <div className="min-w-0">
                            <p className="truncate">Public workspace</p>
                            <small className="truncate">No account required</small>
                        </div>
                    </div>
                    <InstallPortal />
                    <a
                        href="/login"
                        onClick={onNavigate}
                        className="mt-1 rounded-lg transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <Icon name="lock" className="size-4 shrink-0" />
                        <span className="truncate">Sign in</span>
                    </a>
                </footer>
            )}
        </>
    );
}
