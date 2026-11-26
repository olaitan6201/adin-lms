import { workspaceUrl } from '@/lib/workspaceUrl';
import { Link } from '@inertiajs/react';
import { Icon } from '@/components/workspace/Icon';
import type { ReactNode } from 'react';
import { WorkspaceInstall } from './WorkspaceInstall';
import { groupsFor, roles, type RoleKey } from './navigation';
import { RoleSwitcher } from './RoleSwitcher';

export function WorkspaceRail({ role, screen, close, onNavigate }: {
    role: RoleKey; screen: string; close?: ReactNode; onNavigate?: () => void;
}) {
    return <>
        <div className="portal-brand-row">
            <Link href={workspaceUrl(`${role}/${roles[role].home}`)} className="portal-brand" onClick={onNavigate}>
                <img src="/brand/adin/crest.svg" width="42" height="36" alt="" />
                <span><strong>AdinOpen LMS</strong><small>Adin Open University</small></span>
            </Link>{close}
        </div>
        <RoleSwitcher role={role} onNavigate={onNavigate} />
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4" data-scroll aria-label="Module navigation">
            {groupsFor(role).map(({ group, links }) => <div className="mt-4" key={group}>
                <p className="rail-section">{group}</p>
                <ul className="mt-1 space-y-0.5">{links.map(({ key, icon, label }) => <li key={key}>
                    <Link href={workspaceUrl(key)} onClick={onNavigate} aria-current={key === screen ? 'page' : undefined}
                        className={`rail-link ${key === screen ? 'rail-link-active' : ''}`}>
                        <Icon name={icon} className="size-4 shrink-0" /><span className="truncate">{label}</span>
                    </Link>
                </li>)}</ul>
            </div>)}
        </nav>
        <footer className="portal-rail-footer">
            <div><Icon name="shield" className="size-4" /><span>Protected session<small>MFA enforced for privileged roles</small></span></div>
            <WorkspaceInstall />
            <Link href={workspaceUrl('auth/signin')} onClick={onNavigate} className="mt-1 rounded-lg hover:bg-white/10 hover:text-white">
                <Icon name="logout" className="size-4" />Sign out of this session
            </Link>
        </footer>
    </>;
}
