import '../../css/portal-shell.css';
import '../../css/workspace-shell.css';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { usePage } from '@inertiajs/react';
import { Icon } from '@/components/workspace/Icon';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { entries } from './workspace/navigation';
import { RoleSwitcher } from './workspace/RoleSwitcher';
import { WorkspaceOverlays, useWorkspaceOverlays } from './workspace/WorkspaceOverlays';
import { WorkspacePalette } from './workspace/WorkspacePalette';
import { WorkspaceRail } from './workspace/WorkspaceRail';
import { AccessibilityOptions, Notifications } from './workspace/WorkspaceTools';

type Screen = (typeof entries)[number];

function WorkspaceChrome({ screen, children }: { screen: Screen; children: ReactNode }) {
    const { role, key, title } = screen;
    const { notify, close } = useWorkspaceOverlays();
    const [open, setOpen] = useState(false);
    const main = useRef<HTMLElement>(null);
    const previous = useRef(key);
    useEffect(() => {
        if (key !== previous.current) {
            previous.current = key;
            close();
            setOpen(false);
            main.current?.focus({ preventScroll: true });
        }
    }, [key, close]);
    useEffect(() => {
        const desktop = window.matchMedia('(min-width: 1024px)');
        const resize = () => { if (desktop.matches) setOpen(false); };
        desktop.addEventListener('change', resize);
        return () => desktop.removeEventListener('change', resize);
    }, []);
    return <div className="workspace-shell flex min-h-dvh">
        <a className="skip-link" href="#workspace-content">Skip to main content</a>
        <aside className="rail hidden lg:flex" aria-label="Primary navigation"><WorkspaceRail role={role} screen={key} /></aside>
        <div className="flex min-w-0 flex-1 flex-col lg:pl-[var(--rail-w)]">
            <header className="portal-topbar">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger className="portal-icon portal-menu-trigger" aria-label="Open navigation"><Icon name="menu" className="size-5" /></SheetTrigger>
                    <SheetContent side="left" className="portal-mobile-rail" showCloseButton={false}>
                        <SheetTitle className="sr-only">Module navigation</SheetTitle>
                        <SheetDescription className="sr-only">Adin Open University</SheetDescription>
                        <WorkspaceRail role={role} screen={key} onNavigate={() => setOpen(false)} close={
                            <SheetClose className="portal-icon" aria-label="Close navigation"><Icon name="close" className="size-4" /></SheetClose>
                        } />
                    </SheetContent>
                </Sheet>
                <div className="portal-heading">
                    <span className="portal-institution">Adin Open University · 2025/2026 · First Semester</span>
                    <p>{title}</p>
                </div>
                <div className="portal-tools" key={key}><WorkspacePalette /><Notifications notify={notify} />
                    <AccessibilityOptions role={role} /><RoleSwitcher role={role} compact /></div>
            </header>
            <main id="workspace-content" tabIndex={-1} ref={main} className="flex-1 px-4 pt-6 pb-20 outline-none sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-[1560px]">{children}</div>
            </main>
        </div>
    </div>;
}

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
    const { component, props, url } = usePage<{ screenKey?: string }>();
    const componentKey = component.replace(/^Workspace\//, '').toLowerCase();
    const path = url.split(/[?#]/)[0].replace(/\/$/, '');
    const screen = entries.find(item => item.key === (props.screenKey ?? componentKey))
        ?? entries.find(item => path.endsWith(`/${item.key}`));
    if (!screen) return <>{children}</>;
    return <WorkspaceOverlays><WorkspaceChrome screen={screen}>{children}</WorkspaceChrome></WorkspaceOverlays>;
}
