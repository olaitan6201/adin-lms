import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Icon } from '@/components/icons/Icon';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { entries } from '../workspace/navigation';
import { useWorkspaceShell } from '../workspace/shellModel';
import { useWorkspaceOverlays } from '../workspace/WorkspaceOverlays';
import { WorkspaceDrawerEdge } from '../workspace/WorkspaceDrawerEdge';
import { PortalRail } from './PortalRail';
import { PortalTopbar } from './PortalTopbar';
import { ConnectionStatus } from './ConnectionStatus';

type Screen = (typeof entries)[number];
export function PortalChrome({ path, screen, title, children }: {
    path: string;
    screen?: Screen;
    title: string;
    children: ReactNode;
}) {
    const { role, key } = screen ?? {};
    const { brand, live } = useWorkspaceShell();
    const { close } = useWorkspaceOverlays();
    const [open, setOpen] = useState(false);
    const main = useRef<HTMLElement>(null);
    const closeButton = useRef<HTMLButtonElement>(null);
    const navigated = useRef(false);
    const previous = useRef(path);
    const contentId = live ? 'portal-content' : 'workspace-content';
    const Content = live ? 'div' : 'main';

    useEffect(() => {
        if (path !== previous.current) {
            previous.current = path;
            navigated.current = true;
            close();
            setOpen(false);
            main.current?.focus({ preventScroll: true });
        }
    }, [path, close]);
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

    function changeMenuOpen(value: boolean) {
        if (value) {
            navigated.current = false;
        }

        setOpen(value);
    }

    function focusMenuCloseButton(event: Event) {
        event.preventDefault();
        closeButton.current?.focus();
    }

    function restoreFocusAfterNavigation(event: Event) {
        if (navigated.current) {
            event.preventDefault();
            main.current?.focus({ preventScroll: true });
        }
    }

    const mobileMenu = (
        <Sheet open={open} onOpenChange={changeMenuOpen}>
            <SheetTrigger className="btn btn-ghost btn-sm lg:hidden" aria-label={live ? 'Menu' : 'Open navigation'}>
                <Icon name="menu" className="size-5" />
            </SheetTrigger>
            <SheetContent
                side="left"
                className="portal-mobile-rail ws-mobile-rail"
                showCloseButton={false}
                onOpenAutoFocus={focusMenuCloseButton}
                onCloseAutoFocus={restoreFocusAfterNavigation}
            >
                <SheetTitle className="sr-only">{live ? 'Portal menu' : 'Module navigation'}</SheetTitle>
                <SheetDescription className="sr-only">{brand.institution}</SheetDescription>
                <PortalRail
                    path={path}
                    role={role}
                    screen={key}
                    onNavigate={() => setOpen(false)}
                    close={
                        <SheetClose
                            ref={closeButton}
                            className="ml-auto rounded-lg p-1.5 text-ink-400 hover:bg-white/10 hover:text-white"
                            aria-label={live ? 'Close menu' : 'Close navigation'}
                        >
                            <Icon name="close" className="size-4" />
                        </SheetClose>
                    }
                />
            </SheetContent>
        </Sheet>
    );

    return (
        <div className="workspace-shell flex min-h-dvh">
            <a className="skip-link" href={`#${contentId}`}>
                {live ? 'Skip to content' : 'Skip to main content'}
            </a>
            <aside className="rail hidden lg:flex" aria-label="Primary navigation">
                <PortalRail path={path} role={role} screen={key} />
            </aside>
            <div className="flex min-w-0 flex-1 flex-col lg:pl-[var(--rail-w)]">
                <PortalTopbar
                    path={path}
                    role={role}
                    title={title}
                    menu={mobileMenu}
                />
                <Content
                    id={contentId}
                    tabIndex={-1}
                    ref={element => {
                        main.current = element;
                    }}
                    className="flex-1 px-4 pt-6 pb-20 outline-none sm:px-6 lg:px-8"
                >
                    <div className="mx-auto w-full max-w-[1560px]">
                        {live && <ConnectionStatus />}
                        {children}
                    </div>
                </Content>
            </div>
            {key && <WorkspaceDrawerEdge screen={key} />}
        </div>
    );
}
