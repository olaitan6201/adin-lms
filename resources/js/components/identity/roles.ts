export type WorkspaceRole = 'admin' | 'lecturer' | 'student' | 'guardian';
export type TeachingRole = Exclude<WorkspaceRole, 'guardian'>;
