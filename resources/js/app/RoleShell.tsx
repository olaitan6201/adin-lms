import type { ReactNode } from 'react';
import WorkspaceLayout from '@/layouts/WorkspaceLayout';
import { WorkspaceShellContext } from '@/layouts/workspace/shellModel';
import { shell } from '@/data/navigation/shell';

export default function RoleShell({ children }: { children: ReactNode }) {
    return <WorkspaceShellContext.Provider value={shell}>
        <WorkspaceLayout>{children}</WorkspaceLayout>
    </WorkspaceShellContext.Provider>;
}
