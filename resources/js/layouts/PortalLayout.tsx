import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ConnectionStatus } from './ConnectionStatus';
import { SidebarNavigation, type Destination } from './SidebarNavigation';

export function PortalLayout({ children }: { children: ReactNode }) {
    const { url, props } = usePage<{
        signedIn: boolean; branding: { institution: string; logoFull: string }; academicLinks?: Destination[];
    }>();
    const path = url.split(/[?#]/)[0];
    const previous = useRef(path);
    const content = useRef<HTMLDivElement>(null);
    const close = useRef<HTMLButtonElement>(null);
    const navigated = useRef(false);
    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (previous.current === path) return;
        previous.current = path;
        navigated.current = true;
        setOpen(false);
        content.current?.focus({ preventScroll: true });
    }, [path]);
    useEffect(() => {
        const query = window.matchMedia('(min-width: 48rem)');
        const resize = () => { if (query.matches) setOpen(false); };
        query.addEventListener('change', resize);
        return () => query.removeEventListener('change', resize);
    }, []);
    const brand = <Link href={props.signedIn ? '/dashboard' : '/'} aria-label={`${props.branding.institution} home`}
        className="flex min-w-0 items-center gap-3 rounded-md px-2 py-1 focus-visible:ring-2 focus-visible:ring-ring">
        <img src={props.branding.logoFull} alt="" width="42" height="36" className="size-9 shrink-0 object-contain" />
        <span className="text-sm font-semibold leading-tight">{props.branding.institution}</span>
    </Link>;
    const navigation = <SidebarNavigation signedIn={props.signedIn} academicLinks={props.academicLinks ?? []} path={path} />;
    return <SidebarProvider>
        <a href="#portal-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:p-3 focus:ring-2">Skip to content</a>
        <div className="sticky top-0 hidden h-svh shrink-0 border-r md:block">
            <Sidebar collapsible="none">
                <SidebarHeader>{brand}</SidebarHeader>
                <SidebarContent>{navigation}</SidebarContent>
            </Sidebar>
        </div>
        <div className="min-w-0 flex-1">
            <header className="flex items-center justify-between gap-2 border-b px-4 py-2 md:hidden">
                {brand}
                <Sheet open={open} onOpenChange={value => { if (value) navigated.current = false; setOpen(value); }}>
                    <SheetTrigger asChild><Button variant="outline" size="sm">Menu</Button></SheetTrigger>
                    <SheetContent side="left" showCloseButton={false} className="overflow-y-auto"
                        onOpenAutoFocus={event => { event.preventDefault(); close.current?.focus(); }}
                        onCloseAutoFocus={event => { if (navigated.current) { event.preventDefault(); content.current?.focus(); } }}>
                        <SheetHeader>
                            <SheetTitle>Portal menu</SheetTitle>
                            <SheetDescription>{props.branding.institution}</SheetDescription>
                            <SheetClose asChild><Button ref={close} variant="outline" size="sm">Close menu</Button></SheetClose>
                        </SheetHeader>
                        {navigation}
                    </SheetContent>
                </Sheet>
            </header>
            <ConnectionStatus />
            <div id="portal-content" tabIndex={-1} ref={content} className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </div>
    </SidebarProvider>;
}
