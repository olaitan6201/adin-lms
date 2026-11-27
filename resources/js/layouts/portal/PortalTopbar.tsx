import { Icon } from '@/components/icons/Icon';
import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import type { RoleKey } from '../workspace/navigation';
import { RoleSwitcher } from '../workspace/RoleSwitcher';
import { useWorkspaceShell } from '../workspace/shellModel';
import { WorkspaceAccount } from '../workspace/WorkspaceAccount';
import { useWorkspaceOverlays } from '../workspace/WorkspaceOverlays';
import { AccessibilityOptions, Notifications } from '../workspace/WorkspaceTools';
import { PortalSearch } from './PortalSearch';

export function PortalTopbar({ path, role, title, menu }: {
    path: string;
    role?: RoleKey;
    title: string;
    menu: ReactNode;
}) {
    const { brand, academicPeriod, live } = useWorkspaceShell();
    const { notify } = useWorkspaceOverlays();
    const context = [brand.institution, academicPeriod?.year, academicPeriod?.semester]
        .filter(Boolean)
        .join(' · ');

    return (
        <header className="sticky top-0 z-20">
            <div className="flex h-16 items-center gap-3 border-b border-ink-100 bg-white/85 px-4 backdrop-blur-md sm:px-6">
                {menu}
                <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium tracking-[0.1em] text-ink-500 uppercase">
                        {context}
                    </p>
                    <h2 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink-900">
                        {title}
                    </h2>
                </div>
                <div className="portal-tools" key={path}>
                    <PortalSearch />
                    {role && <Notifications notify={notify} />}
                    {live?.notifications && (
                        <Link href={live.notifications} className="btn btn-ghost btn-sm" aria-label="Notifications">
                            <Icon name="bell" className="size-5" />
                        </Link>
                    )}
                    <AccessibilityOptions role={role} settings={live?.settings} />
                    <span aria-hidden="true" className="ml-1 hidden h-8 w-px bg-ink-100 sm:block" />
                    {role ? <RoleSwitcher role={role} compact /> : <WorkspaceAccount />}
                </div>
            </div>
        </header>
    );
}
