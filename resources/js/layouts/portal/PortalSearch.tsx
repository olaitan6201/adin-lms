import { usePaletteFocus } from '../usePaletteFocus';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { Link } from '@inertiajs/react';
import { Icon } from '@/components/icons/Icon';
import { useEffect, useRef, useState } from 'react';
import { entries, roles } from '../workspace/navigation';
import { useWorkspaceShell } from '../workspace/shellModel';

export function PortalSearch() {
    const { live } = useWorkspaceShell();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const { input, results, focusInput, navigateResults } = usePaletteFocus();
    const panel = useRef<HTMLDivElement>(null);
    const destinations = live
        ? live.groups.flatMap(({ label: section, links }) => links.map(({ href, label, Icon: Mark }) => ({
            href,
            label,
            section,
            mark: <Mark className="size-4" aria-hidden="true" />,
        })))
        : entries.map(({ key, role, label, icon }) => ({
            href: workspaceUrl(key),
            label,
            section: roles[role].label,
            mark: <Icon name={icon} className="size-4" />,
        }));
    const normalizedQuery = query.trim()
        .toLowerCase();
    const matches = destinations
        .filter(({ label }) => {
            const normalizedLabel = label.toLowerCase();

            return normalizedLabel.includes(normalizedQuery);
        })
        .slice(0, 40);

    function toggle(value: boolean) {
        setOpen(value);
        if (value) {
            setQuery('');
        }
    }

    useEffect(() => {
        function shortcut(event: KeyboardEvent) {
            if (
                event.defaultPrevented ||
                event.isComposing ||
                !(event.ctrlKey || event.metaKey) ||
                event.key.toLowerCase() !== 'k'
            ) {
                return;
            }

            event.preventDefault();
            if (event.repeat) {
                return;
            }

            const openPanels = [...document.querySelectorAll(
                'dialog:modal, [data-slot="sheet-content"][data-state="open"], [data-slot="dialog-content"][data-state="open"]',
            )];
            if (openPanels.some(modal => modal !== panel.current)) {
                return;
            }

            setOpen(previous => !previous);
            setQuery('');
        }

        window.addEventListener('keydown', shortcut);
        return () => window.removeEventListener('keydown', shortcut);
    }, []);

    return (
        <Dialog open={open} onOpenChange={toggle}>
            <DialogTrigger
                className="ws-search flex items-center gap-2 rounded-lg border border-transparent px-2.5 py-1.5 text-left text-[13px] text-ink-500 transition-colors max-md:hover:bg-ink-100 max-md:hover:text-ink-800 md:h-9 md:w-56 md:border-ink-200 md:bg-white md:px-3 md:py-0 md:hover:border-ink-300"
                aria-label="Search"
            >
                <Icon name="search" className="size-5 shrink-0 md:size-4" />
                <span className="hidden flex-1 truncate md:block">Search</span>
                <kbd className="kbd max-md:hidden">Ctrl K</kbd>
            </DialogTrigger>
            <DialogContent
                ref={panel}
                className="ws-command-palette"
                showCloseButton={false}
                onOpenAutoFocus={focusInput}
                onKeyDown={navigateResults}
            >
                <DialogTitle className="sr-only">Search workspace screens</DialogTitle>
                <div className="flex items-center gap-3 border-b border-ink-100 px-4">
                    <Icon name="search" className="size-4 text-ink-500" />
                    <input
                        autoComplete="off"
                        ref={input}
                        aria-label="Search screens"
                        placeholder={live ? 'Search screens...' : 'Search screens, courses, students...'}
                        className="min-w-0 flex-1 border-0 bg-transparent py-4 text-sm text-ink-800 placeholder:text-ink-500 focus:outline-none focus:ring-0"
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                    />
                    <DialogClose aria-label="Close search">
                        <kbd className="kbd">Esc</kbd>
                    </DialogClose>
                </div>
                <ul className="max-h-[52vh] overflow-y-auto p-2" data-scroll ref={results}>
                    {matches.map(({ href, section, label, mark }) => (
                        <li key={href}>
                            <Link
                                href={href}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-ink-50"
                            >
                                <span className="flex size-8 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
                                    {mark}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[13.5px] font-medium text-ink-800">
                                        {label}
                                    </span>
                                    <span className="block text-[11px] text-ink-500">{section}</span>
                                </span>
                            </Link>
                        </li>
                    ))}
                    {!matches.length && (
                        <li className="px-3 py-8 text-center text-[13px] text-ink-500" role="status">
                            No screen matches that search.
                        </li>
                    )}
                </ul>
                <DialogDescription className="flex items-center justify-between gap-2 border-t border-ink-100 bg-ink-50/60 px-4 py-2.5 text-[11px] text-ink-500">
                    <span>Enter to open · Up and Down to move</span>
                    {!live && <span>Prototype navigation</span>}
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
}
