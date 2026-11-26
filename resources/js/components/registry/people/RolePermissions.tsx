import { Records, status } from '@/components/registry/Records';
import { Icon } from '@/components/icons/Icon';
import type { RoleEntry } from '@/types/registry/people';

export function RolePermissions({
    roleMatrix,
    permissionMatrix,
}: {
    roleMatrix: RoleEntry[];
    permissionMatrix: ({ permission: string } & Record<string, string | boolean>)[];
}) {
    return (
        <>
            <Records
                title="Role register"
                subtitle="Every role carries an explicit scope and module entitlement"
                columns={['Role', 'Users', 'Scope', 'Modules', 'MFA']}
                rows={roleMatrix.map((r) => [
                    r.role,
                    r.users,
                    r.scope,
                    r.modules,
                    status(r.mfa, r.mfa === 'Required' ? 'emerald' : 'slate'),
                ])}
            />
            <Records
                bodyClassName="p-0"
                title="Permission matrix"
                subtitle="Read as: full access, named scope, or no access"
                columns={['Permission', 'Super Admin', 'Inst. Admin', 'ICT', 'Dean', 'HoD', 'Lecturer', 'Student']}
                rows={permissionMatrix.map(({ permission, ...rights }) => [
                    permission,
                    ...Object.values(rights).map((v) =>
                        typeof v === 'boolean' ? (
                            <span aria-label={v ? 'Full access' : 'No access'}>
                                <Icon
                                    name={v ? 'check' : 'close'}
                                    className={v ? 'size-4 text-brand-600' : 'size-3.5 text-ink-300'}
                                />
                            </span>
                        ) : (
                            v
                        ),
                    ),
                ])}
            />
        </>
    );
}
