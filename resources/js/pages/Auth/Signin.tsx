import { Link } from '@inertiajs/react';
import { AccessField, AccessFrame, AccessNote, useAccessNotice } from '@/components/auth/AccessFrame';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { useWorkspaceShell } from '@/layouts/workspace/shellModel';

export default function Signin() {
    const { notify, feedback } = useAccessNotice();
    const { brand } = useWorkspaceShell();
    return <AccessFrame mode="signin" brand={brand} eyebrow="Sign in" title="Access your learning record"
        intro="Use the identifier issued to you. The system accepts a matric number, a staff ID or your institutional email address.">
        <form className="mt-7 space-y-4" onSubmit={event => {
            event.preventDefault();
            notify('Sign-in submitted. In the full system a second factor is requested for privileged roles.');
        }}>
            <AccessField label="Matric number, staff ID or email" type="text" autoComplete="username"
                placeholder="AOU/2023/0412" hint="The identifier shown on your registration or staff card." />
            <AccessField label="Password" type="password" autoComplete="current-password" placeholder="Enter your password" />
            <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-[12.5px] text-ink-600">
                    <input type="checkbox" className="h-4 w-4 rounded border-ink-300 text-brand-600" />Keep me signed in on this device
                </label>
                <Link href={workspaceUrl('auth/recover')} className="text-center text-[12.5px] font-medium text-brand-700 hover:underline">Forgotten your password?</Link>
            </div>
            <button className="btn btn-primary w-full justify-center" type="submit">Sign in</button>
        </form>
        <div className="mt-6 space-y-3">
            <AccessNote>Accounts are issued by the Registrar. A student who cannot sign in should report to the ICT Directorate rather than create an account.</AccessNote>
            <AccessNote warning>Privileged roles are challenged for a second factor on every new device. A session left idle for 30 minutes is revoked.</AccessNote>
        </div>
        {feedback}
    </AccessFrame>;
}
