import type { WorkspaceShellModel } from '@/layouts/workspace/shellModel';
import { notices } from './notices';

export const shell: WorkspaceShellModel = {
    brand: { name: 'AdinOpen LMS', institution: 'Adin Open University', crest: '/brand/adin/crest.svg' },
    academicPeriod: { year: '2025/2026', semester: 'First Semester' },
    session: { title: 'Protected session', detail: 'MFA enforced for privileged roles' },
    identities: {
        admin: { name: 'Dr. Ifeoma Nwachukwu' },
        lecturer: { name: 'Dr. Peter Adeyemi' },
        student: { name: 'Blessing Okonkwo' },
        guardian: { name: 'Mrs. Tonia Okonkwo' },
    },
    notices,
};
