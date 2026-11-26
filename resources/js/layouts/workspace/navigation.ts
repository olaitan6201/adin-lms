const modules = {
    overview: ['Dashboard', 'dashboard'], structure: ['Academic structure', 'hierarchy'],
    people: ['People and roles', 'users'], curriculum: ['Curriculum catalogue', 'layers'],
    delivery: ['Course delivery', 'book'], content: ['Content library', 'document'],
    course: ['Course overview', 'graduation'], classroom: ['Live classroom', 'video'],
    assignments: ['Assignments', 'clipboard'], cbt: ['CBT examinations', 'timer'],
    gradebook: ['Gradebook', 'chart'], attendance: ['Attendance', 'calendarCheck'],
    communication: ['Communication', 'chat'], calendar: ['Calendar', 'calendar'],
    reports: ['Reports and analytics', 'trend'], qa: ['QA and compliance', 'target'],
    administration: ['Administration', 'settings'], courses: ['My courses', 'book'],
    exam: ['Exam hall', 'timer'], results: ['Results', 'award'], downloads: ['Offline downloads', 'download'],
    progress: ['Approved progress', 'award'], 'settings/notifications': ['Notification settings', 'bell'],
} as const;

type ModuleKey = keyof typeof modules;
export type RoleKey = 'admin' | 'lecturer' | 'student' | 'guardian';
type Role = { label: string; short: string; person: string; home: ModuleKey; groups: Record<string, ModuleKey[]> };
const personal: ModuleKey[] = ['settings/notifications'];
const engagement: ModuleKey[] = ['communication', 'calendar', 'reports'];
const assessment: ModuleKey[] = ['assignments', 'cbt', 'gradebook', 'attendance'];

export const roles: Record<RoleKey, Role> = {
    admin: {
        label: 'Super Admin', short: 'ICT', person: 'Dr. Ifeoma Nwachukwu', home: 'overview',
        groups: {
            Overview: ['overview'], Academic: ['structure', 'people', 'curriculum', 'delivery'],
            Content: ['content', 'course', 'classroom'], Assessment: assessment, Engagement: engagement,
            System: ['qa', 'administration'], Personal: personal,
        },
    },
    lecturer: {
        label: 'Lecturer', short: 'LECT', person: 'Dr. Peter Adeyemi', home: 'overview',
        groups: {
            Overview: ['overview'], Teaching: ['courses', 'course', 'classroom'], Assessment: assessment,
            Engagement: engagement, Personal: personal,
        },
    },
    student: {
        label: 'Student', short: 'STU', person: 'Blessing Okonkwo', home: 'overview',
        groups: {
            Overview: ['overview'], Learning: ['courses', 'course', 'downloads'],
            Assessment: ['assignments', 'exam', 'results'], Engagement: ['communication', 'calendar'], Personal: personal,
        },
    },
    guardian: {
        label: 'Guardian', short: 'GUARD', person: 'Mrs. Tonia Okonkwo', home: 'progress',
        groups: { Learning: ['progress'], Personal: personal },
    },
};

export function groupsFor(role: RoleKey) {
    return Object.entries(roles[role].groups).map(([group, items]) => ({
        group,
        links: items.map(module => {
            const [name, icon] = modules[module];
            const title = module === 'course' && role !== 'admin'
                ? (role === 'student' ? 'Course player' : 'Course workspace') : name;
            const label = role === 'lecturer' && module === 'assignments' ? 'Assignments and marking'
                : role === 'lecturer' && module === 'reports' ? 'Reports' : title;
            return { key: `${role}/${module}`, label, title, icon: module === 'course' && role !== 'admin' ? 'layers' : icon };
        }),
    }));
}

export const roleKeys = Object.keys(roles) as RoleKey[];
export const entries = roleKeys.flatMap(role => groupsFor(role).flatMap(group => group.links.map(link => ({ ...link, role }))));
