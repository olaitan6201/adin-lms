import { useRef, type KeyboardEvent } from 'react';

export function usePaletteFocus() {
    const input = useRef<HTMLInputElement>(null);
    const results = useRef<HTMLUListElement>(null);

    function focusInput(event: Event) {
        event.preventDefault();
        input.current?.focus();
    }

    function navigateResults(event: KeyboardEvent<HTMLDivElement>) {
        const links = Array.from(results.current?.querySelectorAll('a') ?? []);
        if (event.key === 'Enter' && document.activeElement === input.current) {
            event.preventDefault();
            links[0]?.click();
            return;
        }

        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
            return;
        }

        event.preventDefault();
        const index = links.indexOf(document.activeElement as HTMLAnchorElement);
        const next = index + (event.key === 'ArrowDown' ? 1 : -1);
        if (next < 0) {
            input.current?.focus();
        } else {
            links[Math.min(next, links.length - 1)]?.focus();
        }
    }

    return { input, results, focusInput, navigateResults };
}
