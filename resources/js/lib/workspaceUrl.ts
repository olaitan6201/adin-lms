const aliases: Record<string, string> = {
    'admin/qa': 'admin/qa-review',
    'student/downloads': 'student/offline-downloads',
};

export function workspaceUrl(screen: string): string {
    return `/${aliases[screen] ?? screen}`;
}
