import { workspaceUrl } from '@/lib/workspaceUrl';
import { Link } from '@inertiajs/react';
import { Icon } from '@/components/icons/Icon';
import type { ReactNode } from 'react';
import { WorkspaceInstall } from './WorkspaceInstall';
import { groupsFor, roles, type RoleKey } from './navigation';
import { RoleSwitcher } from './RoleSwitcher';
import { useWorkspaceShell } from './shellModel';
import { InstitutionMark } from '@/components/icons/InstitutionMark';

export function WorkspaceRail({
    role,
    screen,
    close,
    onNavigate,
}: {
    role: RoleKey;
    screen: string;
    close?: ReactNode;
    onNavigate?: () => void;
}) {
    const { brand } = useWorkspaceShell();
    return (
        <>
            <div className="portal-brand-row">
                <Link href={workspaceUrl(`${role}/${roles[role].home}`)} className="portal-brand" onClick={onNavigate}>
                    <InstitutionMark source={brand.crest} className="h-9 w-auto shrink-0" />
                    <span>
                        <strong>{brand.name}</strong>
                        <small>{brand.institution}</small>
                    </span>
                </Link>
                {close}
            </div>
            <RoleSwitcher role={role} onNavigate={onNavigate} />
            <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4" data-scroll aria-label="Module navigation">
                {groupsFor(role).map(({ group, links }) => (
                    <div className="mt-4" key={group}>
                        <p className="rail-section">{group}</p>
                        <ul className="mt-1 space-y-0.5">
                            {links.map(({ key, icon, label }) => (
                                <li key={key}>
                                    <Link
                                        href={workspaceUrl(key)}
                                        onClick={onNavigate}
                                        aria-current={key === screen ? 'page' : undefined}
                                        className={`rail-link ${key === screen ? 'rail-link-active' : ''}`}
                                    >
                                        <Icon name={icon} className="size-4 shrink-0" />
                                        <span className="truncate">{label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>
            <footer className="portal-rail-footer">
                <div>
                    <Icon name="info" className="size-4 shrink-0" />
                    <div className="min-w-0">
                        <p className="truncate">Public workspace</p>
                        <small className="truncate">No account required</small>
                    </div>
                </div>
                <WorkspaceInstall />
                <a
                    href="/login"
                    onClick={onNavigate}
                    className="mt-1 rounded-lg transition-colors hover:bg-white/10 hover:text-white"
                >
                    <Icon name="lock" className="size-4 shrink-0" />
                    <span className="truncate">Sign in</span>
                </a>
            </footer>
        </>
    );
}
