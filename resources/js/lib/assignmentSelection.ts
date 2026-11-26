type SelectionKind = 'assignment' | 'submission';

export function selectionFragment(kind: SelectionKind, id: string): string {
    return `#${new URLSearchParams([[kind, id]])}`;
}

export function initialSelection(kind: SelectionKind): string | undefined {
    if (typeof window === 'undefined') {
        return undefined;
    }
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    return fragment.size === 1 ? fragment.get(kind) ?? undefined : undefined;
}
