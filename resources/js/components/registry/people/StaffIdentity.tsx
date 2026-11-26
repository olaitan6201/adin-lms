import type { StaffRecord, DirectorySummary, RoleEntry } from '@/types/registry/people';
import { Field, Note } from '@/components/registry/Desk';
import { status, cap } from '@/components/registry/Records';
import { Card } from '@/components/ui/layout/Card';
import { Sessions } from './Sessions';
export function StaffIdentity({
    member,
    directorySummary,
    devices,
    roleMatrix,
}: {
    member?: StaffRecord;
    directorySummary: DirectorySummary;
    devices: string[][];
    roleMatrix: RoleEntry[];
}) {
    return (
        <>
            {member && (
                <div className="flex flex-wrap gap-2">
                    {status(member.role, 'emerald')}
                    {status(member.mfa ? 'MFA enrolled' : 'Not enrolled', member.mfa ? 'emerald' : 'amber')}
                    {status(cap(member.status))}
                    {status('Sessions: 2')}
                </div>
            )}
            <Card title="Identity">
                <div className="grid gap-3 sm:grid-cols-2">
                    {member ? (
                        <Field
                            label="Staff ID"
                            value={
                                member.id === directorySummary.superAdminId
                                    ? directorySummary.staffNumber
                                    : member.id.toUpperCase()
                            }
                            readOnly
                        />
                    ) : (
                        <>
                            <Field label="Name" required />
                            <Field label="Unit" required />
                        </>
                    )}
                    <Field label="Email" type="email" value={member?.email} />
                    <Field
                        label="Role"
                        value={member?.role}
                        options={
                            member?.role === 'Super Admin'
                                ? ['Super Admin', 'ICT Manager']
                                : roleMatrix.filter((role) => role.role !== 'Student').map((role) => role.role)
                        }
                    />
                    <Field
                        label="Idle logout"
                        value={member?.idle}
                        options={['30 minutes', '15 minutes', '60 minutes']}
                    />
                </div>
            </Card>
            {member && <Sessions devices={devices} />}
            <Note amber>
                Privileged roles must enrol in multi-factor authentication. Password recovery resets the secret and
                revokes every active session.
            </Note>
        </>
    );
}
