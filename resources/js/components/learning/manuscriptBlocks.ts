export function manuscriptBlocks(text?: string | null) {
    return (text ?? '')
        .replace(/\r\n/g, '\n')
        .trim()
        .split(/\n\s*\n/);
}

export function resourceId(block: string) {
    return /^\{\{resource:([a-f0-9-]{36})\}\}$/.exec(block)?.[1];
}
