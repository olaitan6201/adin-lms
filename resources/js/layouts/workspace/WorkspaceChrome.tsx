import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Icon } from '@/components/icons/Icon';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { entries } from './navigation';
import { useWorkspaceShell } from './shellModel';
import { RoleSwitcher } from './RoleSwitcher';
import { useWorkspaceOverlays } from './WorkspaceOverlays';
import { WorkspacePalette } from './WorkspacePalette';
import { WorkspaceRail } from './WorkspaceRail';
import { WorkspaceDrawerEdge } from './WorkspaceDrawerEdge';
import { AccessibilityOptions, Notifications } from './WorkspaceTools';

type Screen = (typeof entries)[number];
export function WorkspaceChrome({ screen, children }: {
    screen: Screen;
    children: ReactNode
}) {
    const { role, key, title } = screen;
    const { brand, academicPeriod } = useWorkspaceShell();
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
        const resize = () => {
            if (desktop.matches) {
                setOpen(false);
            }
        };

        desktop.addEventListener('change', resize);
        return () => desktop.removeEventListener('change', resize);
    }, []);
    return (
        <div className="workspace-shell flex min-h-dvh">
            <a className="skip-link" href="#workspace-content">
                Skip to main content
            </a>
            <aside className="rail hidden lg:flex" aria-label="Primary navigation">
                <WorkspaceRail role={role} screen={key} />
            </aside>
            <div className="flex min-w-0 flex-1 flex-col lg:pl-[var(--rail-w)]">
                <header className="sticky top-0 z-20">
                    <div className="flex h-16 items-center gap-3 border-b border-ink-100 bg-white/85 px-4 backdrop-blur-md sm:px-6">
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger className="btn btn-ghost btn-sm lg:hidden" aria-label="Open navigation">
                                <Icon name="menu" className="size-5" />
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="portal-mobile-rail ws-mobile-rail"
                                showCloseButton={false}
                            >
                                <SheetTitle className="sr-only">Module navigation</SheetTitle>
                                <SheetDescription className="sr-only">{brand.institution}</SheetDescription>
                                <WorkspaceRail
                                    role={role}
                                    screen={key}
                                    onNavigate={() => setOpen(false)}
                                    close={
                                        <SheetClose
                                            className="ml-auto rounded-lg p-1.5 text-ink-400 hover:bg-white/10 hover:text-white"
                                            aria-label="Close navigation"
                                        >
                                            <Icon name="close" className="size-4" />
                                        </SheetClose>
                                    }
                                />
                            </SheetContent>
                        </Sheet>
                        <div className="min-w-0">
                            <p className="truncate text-[11px] font-medium tracking-[0.1em] text-ink-400 uppercase">
                                {`${brand.institution} · ${academicPeriod.year} · ${academicPeriod.semester}`}
                            </p>
                            <h2 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink-900">
                                {title}
                            </h2>
                        </div>
                        <div className="portal-tools" key={key}>
                            <WorkspacePalette />
                            <Notifications notify={notify} />
                            <AccessibilityOptions role={role} />
                            <span aria-hidden="true" className="ml-1 hidden h-8 w-px bg-ink-100 sm:block" />
                            <RoleSwitcher role={role} compact />
                        </div>
                    </div>
                </header>
                <main
                    id="workspace-content"
                    tabIndex={-1}
                    ref={main}
                    className="flex-1 px-4 pt-6 pb-20 outline-none sm:px-6 lg:px-8"
                >
                    <div className="mx-auto w-full max-w-[1560px]">{children}</div>
                </main>
            </div>
            <WorkspaceDrawerEdge screen={key} />
        </div>
    );
}
