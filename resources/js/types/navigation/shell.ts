import type { WorkspaceRole } from '@/types/identity/roles';
import type { LucideIcon } from 'lucide-react';

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
    academicPeriod?: {
        year: string;
        semester: string;
    };
    identities?: Record<WorkspaceRole, { name: string }>;
    notices: readonly ShellNotice[];
    live?: {
        groups: { label: string; links: { href: string; label: string; Icon: LucideIcon }[] }[];
        account: { name: string; role: string } | null;
        home: string;
        notifications?: string;
        settings?: string;
        profile?: string;
        signedIn: boolean;
    };
};
