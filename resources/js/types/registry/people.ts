export type StaffRecord = {
    id: string;
    name: string;
    role: string;
    unit: string;
    lastActive: string;
    status: string;
    email: string;
    idle: string;
    mfa: boolean;
};
export type StudentRecord = {
    id: string;
    name: string;
    matric: string;
    programme: string;
    status: string;
    email: string;
    level: number;
    attendance: number;
    gpa: number;
};
export type RoleEntry = { role: string; scope: string; modules: string; mfa: string; users: number };
export type DirectorySummary = {
    superAdminId: string;
    staffNumber: string;
    historyStudentId: string;
    staff: number;
    students: number;
    roles: number;
};
export type PeopleDirectoryInputs = {
    staffDirectory: StaffRecord[];
    studentDirectory: StudentRecord[];
    devices: string[][];
    learningHistory: [string, string][];
    studentMetrics: [string, string, string?][];
    directorySummary: DirectorySummary;
    roleMatrix: RoleEntry[];
    permissionMatrix: ({ permission: string } & Record<string, string | boolean>)[];
};
