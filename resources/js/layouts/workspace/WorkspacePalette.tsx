import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { Link } from '@inertiajs/react';
import { Icon } from '@/components/workspace/Icon';
import { useEffect, useRef, useState } from 'react';
import { entries, roles } from './navigation';

export function WorkspacePalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const input = useRef<HTMLInputElement>(null);
    const list = useRef<HTMLUListElement>(null);
    const matches = entries.filter(({ label }) => label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 40);
    function toggle(value: boolean) {
        setOpen(value);
        if (value) setQuery('');
    }
    useEffect(() => {
        function shortcut(event: KeyboardEvent) {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                toggle(true);
            }
        }
        window.addEventListener('keydown', shortcut);
        return () => window.removeEventListener('keydown', shortcut);
    }, []);
    return <Dialog open={open} onOpenChange={toggle}>
        <DialogTrigger className="portal-search" aria-label="Search"><Icon name="search" className="size-5 md:size-4" /><span>Search</span><kbd>Ctrl K</kbd></DialogTrigger>
        <DialogContent className="portal-palette" showCloseButton={false} onOpenAutoFocus={event => {
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
            <div className="portal-palette-input"><Icon name="search" className="size-4" />
                <input autoComplete="off" ref={input} aria-label="Search screens" placeholder="Search screens, courses, students..."
                    value={query} onChange={event => setQuery(event.target.value)} />
                <DialogClose aria-label="Close search"><kbd>Esc</kbd></DialogClose>
            </div>
            <ul data-scroll ref={list}>{matches.map(({ key, role, label, icon }) => <li key={key}>
                <Link href={workspaceUrl(key)} onClick={() => setOpen(false)}><Icon name={icon} className="size-4" /><span>{label}<small>{roles[role].label}</small></span></Link>
            </li>)}
                {!matches.length && <li className="portal-no-results" role="status">No screen matches that search.</li>}
            </ul>
            <DialogDescription className="portal-palette-help flex justify-between gap-2">
                <span>Enter to open · Up and Down to move</span><span>Prototype navigation</span>
            </DialogDescription>
        </DialogContent>
    </Dialog>;
}
