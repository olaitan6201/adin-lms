import type { Page } from '@inertiajs/core';
import { PortalLayout } from '@/layouts/PortalLayout';
import type { WorkspaceShellModel } from '@/types/navigation/shell';

let fixtureShell: Promise<WorkspaceShellModel> | undefined;

export function resolvePortalLayout(_: string, page: Page) {
    if (typeof page.props.screenKey !== 'string') {
        return PortalLayout;
    }

    fixtureShell ??= import('../data/navigation/shell').then(module => module.shell);

    return { component: PortalLayout, props: { fixtureShell } };
}
