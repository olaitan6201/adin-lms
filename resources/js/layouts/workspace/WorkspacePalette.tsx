import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { Link } from '@inertiajs/react';
import { Icon } from '@/components/icons/Icon';
import { useEffect, useRef, useState } from 'react';
import { entries, roles } from './navigation';

export function WorkspacePalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const input = useRef<HTMLInputElement>(null);
    const list = useRef<HTMLUListElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const matches = entries.filter(({ label }) => label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 40);
    function toggle(value: boolean) {
        setOpen(value);
        if (value) setQuery('');
    }
    useEffect(() => {
        function shortcut(event: KeyboardEvent) {
            if (event.defaultPrevented || event.isComposing || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k') return;
            event.preventDefault();
            if (event.repeat) return;

            const modals = document.querySelectorAll(
                'dialog:modal, [data-slot="sheet-content"][data-state="open"], [data-slot="dialog-content"][data-state="open"]',
            );
            if (Array.from(modals).some(modal => modal !== panel.current)) return;

            setOpen(previous => !previous);
            setQuery('');
        }
        window.addEventListener('keydown', shortcut);
        return () => window.removeEventListener('keydown', shortcut);
    }, []);
    return <Dialog open={open} onOpenChange={toggle}>
        <DialogTrigger className="ws-search flex items-center gap-2 rounded-[8px] border border-transparent px-2.5 py-1.5 text-left text-[13px] text-ink-500 hover:bg-ink-100 md:h-9 md:w-56 md:border-ink-200 md:bg-white md:px-3 md:py-0 md:text-ink-400 md:hover:border-ink-300"
            aria-label="Search"><Icon name="search" className="size-5 shrink-0 md:size-4" /><span className="hidden flex-1 truncate md:block">Search</span>
            <kbd className="kbd max-md:hidden">Ctrl K</kbd></DialogTrigger>
        <DialogContent ref={panel} className="ws-command-palette" showCloseButton={false} onOpenAutoFocus={event => {
            event.preventDefault();
            input.current?.focus();
        }} onKeyDown={event => {
            const links = Array.from(list.current?.querySelectorAll('a') ?? []);
            const index = links.indexOf(document.activeElement as HTMLAnchorElement);
            if (event.key === 'Enter' && document.activeElement === input.current) {
                event.preventDefault();
                links[0]?.click();
            } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                const next = index + (event.key === 'ArrowDown' ? 1 : -1);
                if (next < 0) input.current?.focus();
                else links[Math.min(next, links.length - 1)]?.focus();
            }
        }}>
            <DialogTitle className="sr-only">Search workspace screens</DialogTitle>
            <div className="flex items-center gap-3 border-b border-ink-100 px-4"><Icon name="search" className="size-4 text-ink-400" />
                <input autoComplete="off" ref={input} aria-label="Search screens" placeholder="Search screens, courses, students..."
                    className="min-w-0 flex-1 border-0 bg-transparent py-4 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-0"
                    value={query} onChange={event => setQuery(event.target.value)} />
                <DialogClose aria-label="Close search"><kbd className="kbd">Esc</kbd></DialogClose>
            </div>
            <ul className="max-h-[52vh] overflow-y-auto p-2" data-scroll ref={list}>{matches.map(({ key, role, label, icon }) => <li key={key}>
                <Link href={workspaceUrl(key)} onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-ink-50">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-ink-50 text-ink-500"><Icon name={icon} className="size-4" /></span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-ink-800">{label}</span>
                        <span className="block text-[11px] text-ink-400">{roles[role].label}</span>
                    </span>
                </Link>
            </li>)}
                {!matches.length && <li className="px-3 py-8 text-center text-[13px] text-ink-400" role="status">No screen matches that search.</li>}
            </ul>
            <DialogDescription className="flex items-center justify-between gap-2 border-t border-ink-100 bg-ink-50/60 px-4 py-2.5 text-[11px] text-ink-400">
                <span>Enter to open · Up and Down to move</span><span>Prototype navigation</span>
            </DialogDescription>
        </DialogContent>
    </Dialog>;
}
