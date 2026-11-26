import type { WorkspaceRole } from '@/types/identity/roles';

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
    identities: Record<WorkspaceRole, { name: string }>;
    notices: readonly ShellNotice[];
};
