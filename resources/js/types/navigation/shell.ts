import type { WorkspaceRole } from '@/types/identity/roles';

export type ShellNotice = {
    id: string;
    title: string;
    meta: string;
    time: string;
    tone: 'info' | 'warning' | 'success' | 'danger';
    needsAttention: boolean;
};

export type CrestSource =
    | {
        kind: 'image';
        src: string;
    }
    | {
        kind: 'symbol';
        href: '/brand/adin/crest.svg#crest-art';
    };

export type WorkspaceShellModel = {
    brand: {
        name: string;
        institution: string;
        crest: CrestSource;
    };
    academicPeriod: {
        year: string;
        semester: string;
    };
    session: {
        title: string;
        detail: string;
    };
    identities: Record<WorkspaceRole, { name: string }>;
    notices: readonly ShellNotice[];
};
