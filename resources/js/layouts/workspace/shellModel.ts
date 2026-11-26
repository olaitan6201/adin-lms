import { createContext, useContext } from 'react';
import type { RoleKey } from './navigation';

export type ShellNotice = {
    id: string;
    title: string;
    meta: string;
    time: string;
    tone: 'info' | 'warning' | 'success' | 'danger';
    needsAttention: boolean;
};

export type WorkspaceShellModel = {
    brand: { name: string; institution: string; crest: string };
    academicPeriod: { year: string; semester: string };
    session: { title: string; detail: string };
    identities: Record<RoleKey, { name: string }>;
    notices: readonly ShellNotice[];
};

export const WorkspaceShellContext = createContext<WorkspaceShellModel | null>(null);

export function useWorkspaceShell() {
    const shell = useContext(WorkspaceShellContext);
    if (!shell) throw new Error('Workspace chrome requires an injected WorkspaceShellModel.');
    return shell;
}
