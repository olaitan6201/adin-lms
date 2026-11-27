import { usePage } from '@inertiajs/react';
import { Suspense, use, useEffect, useRef, type ReactNode } from 'react';
import type { WorkspaceShellModel } from '@/types/navigation/shell';
import { ConnectionStatus } from './portal/ConnectionStatus';
import { PortalChrome } from './portal/PortalChrome';
import { liveWorkspaceShell, type PortalProps } from './workspace/liveWorkspaceShell';
import { entries } from './workspace/navigation';
import { WorkspaceShellContext } from './workspace/shellModel';
import { WorkspaceOverlays } from './workspace/WorkspaceOverlays';

export function PortalLayout({ children, fixtureShell }: {
    children: ReactNode;
    fixtureShell?: Promise<WorkspaceShellModel>;
}) {
    const { component, props, url } = usePage<PortalProps>();
    const path = url.split(/[?#]/)[0];
    const previous = useRef(path);
    const authContent = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (previous.current !== path) {
            previous.current = path;
            authContent.current?.focus({ preventScroll: true });
        }
    }, [path]);

    if (component.startsWith('Auth/') || component === 'Security/Challenge') {
        return (
            <div className="portal-bare">
                <ConnectionStatus />
                <div
                    id="portal-content"
                    className="outline-none"
                    tabIndex={-1}
                    ref={authContent}
                >
                    {children}
                </div>
            </div>
        );
    }

    const fixture = fixtureShell && entries.find(entry => entry.key === props.screenKey);
    if (fixture && fixtureShell) {
        return (
            <Suspense fallback={<p role="status" className="p-6">Loading workspace…</p>}>
                <FixtureContent path={path} screen={fixture} model={fixtureShell}>
                    {children}
                </FixtureContent>
            </Suspense>
        );
    }

    const model = liveWorkspaceShell(props);
    const destination = model.live?.groups
        .flatMap(group => group.links)
        .find(link => link.href === path);
    const segments = component.split('/');
    const componentName = segments.at(-1) ?? '';
    const componentLabel = componentName.replace(/([a-z])([A-Z])/g, '$1 $2');
    const title = destination?.label ?? componentLabel;

    return (
        <PortalContent path={path} title={title} model={model}>
            {children}
        </PortalContent>
    );
}

type Screen = (typeof entries)[number];

function FixtureContent({ path, screen, model, children }: {
    path: string;
    screen: Screen;
    model: Promise<WorkspaceShellModel>;
    children: ReactNode;
}) {
    const shell = use(model);

    return (
        <PortalContent
            path={path}
            screen={screen}
            title={screen.title}
            model={shell}
        >
            {children}
        </PortalContent>
    );
}

function PortalContent({ path, screen, title, model, children }: {
    path: string;
    screen?: Screen;
    title: string;
    model: WorkspaceShellModel;
    children: ReactNode;
}) {
    return (
        <WorkspaceShellContext.Provider value={model}>
            <WorkspaceOverlays>
                <PortalChrome
                    path={path}
                    screen={screen}
                    title={title}
                >
                    {children}
                </PortalChrome>
            </WorkspaceOverlays>
        </WorkspaceShellContext.Provider>
    );
}
