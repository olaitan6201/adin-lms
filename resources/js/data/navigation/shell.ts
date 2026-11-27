import type { WorkspaceShellModel } from '@/types/navigation/shell';
import { notices } from './notices';

export const shell: WorkspaceShellModel = {
    brand: {
        name: 'AdinOpen LMS',
        institution: 'Adin Open University',
        crest: { kind: 'symbol', href: '/brand/adin/crest.svg#crest-art' },
    },
    academicPeriod: { year: '2025/2026', semester: 'First Semester' },
    identities: {
        admin: { name: 'Dr. Ifeoma Nwachukwu' },
        lecturer: { name: 'Dr. Peter Adeyemi' },
        student: { name: 'Blessing Okonkwo' },
        guardian: { name: 'Mrs. Tonia Okonkwo' },
    },
    notices,
};
