import { usePaletteFocus } from '../usePaletteFocus';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Link } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { navigationGroups, type Destination } from './SidebarNavigation';

export function PortalSearch({ academicLinks }: { academicLinks: Destination[] }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const { input, results, focusInput, navigateResults } = usePaletteFocus();
    const needle = query.trim().toLowerCase();
    const matches = navigationGroups(true, academicLinks).flatMap(group =>
        group.links
            .filter(link => link.href && link.label.toLowerCase().includes(needle))
            .map(link => ({ ...link, section: group.label })),
    );
    useEffect(() => {
        const shortcut = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setQuery('');
                setOpen(true);
            }
        };

        window.addEventListener('keydown', shortcut);
        return () => window.removeEventListener('keydown', shortcut);
    }, []);
    return (
        <Dialog
            open={open}
            onOpenChange={value => {
                setOpen(value);
                if (value) {
                    setQuery('');
                }
            }}
        >
            <DialogTrigger className="portal-search" aria-label="Search navigation">
                <Search size={16} />
                <span>Search</span>
                <kbd>Ctrl K</kbd>
            </DialogTrigger>
            <DialogContent
                className="portal-palette"
                showCloseButton={false}
                onOpenAutoFocus={focusInput}
                onKeyDown={navigateResults}
            >
                <DialogTitle className="sr-only">Search navigation</DialogTitle>
                <div className="portal-palette-input">
                    <Search size={16} />
                    <input
                        ref={input}
                        aria-label="Search screens"
                        placeholder="Search screens…"
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                    />
                    <DialogClose aria-label="Close search">
                        <kbd>Esc</kbd>
                    </DialogClose>
                </div>
                <ul ref={results}>
                    {matches.map(
                        ({ href, Icon, label, section }) =>
                            href && (
                                <li key={href}>
                                    <Link href={href} onClick={() => setOpen(false)}>
                                        <Icon size={16} />
                                        <span>
                                            {label}
                                            <small>{section}</small>
                                        </span>
                                    </Link>
                                </li>
                            ),
                    )}
                    {!matches.length && (
                        <li className="portal-no-results" role="status">
                            No screen matches that search.
                        </li>
                    )}
                </ul>
                <DialogDescription className="portal-palette-help">
                    Enter to open · Up and Down to move
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
}
