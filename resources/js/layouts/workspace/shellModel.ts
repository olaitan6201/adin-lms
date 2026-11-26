import { createContext, useContext } from 'react';
import type { WorkspaceShellModel } from '@/types/navigation/shell';

export const WorkspaceShellContext = createContext<WorkspaceShellModel | null>(null);

export function useWorkspaceShell() {
    const shell = useContext(WorkspaceShellContext);
    if (!shell) throw new Error('Workspace chrome requires an injected WorkspaceShellModel.');

    return shell;
}
