import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { WorkspaceChrome } from './workspace/WorkspaceChrome';
import { entries } from './workspace/navigation';
import { WorkspaceOverlays } from './workspace/WorkspaceOverlays';

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
    const { component, props, url } = usePage<{ screenKey?: string }>();
    const componentKey = component.replace(/^Workspace\//, '').toLowerCase();
    const path = url.split(/[?#]/)[0].replace(/\/$/, '');
    const screen =
        entries.find(item => item.key === (props.screenKey ?? componentKey)) ??
        entries.find(item => path.endsWith(`/${item.key}`));
    if (!screen) return <>{children}</>;

    return (
        <WorkspaceOverlays>
            <WorkspaceChrome screen={screen}>{children}</WorkspaceChrome>
        </WorkspaceOverlays>
    );
}
