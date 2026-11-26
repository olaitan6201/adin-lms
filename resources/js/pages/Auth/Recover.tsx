import { AccessField, AccessFrame, AccessNote, useAccessNotice } from '@/components/identity/AccessFrame';

export default function Recover() {
    const { notify, feedback } = useAccessNotice();
    return <AccessFrame mode="recover" eyebrow="Password recovery" title="Reset your password"
        intro="Enter the identifier issued to you. If it matches an active account, a recovery code is sent to the channel registered against it.">
        <form className="mt-7 space-y-4" onSubmit={event => {
            event.preventDefault();
            notify('Password reset recorded. The account is signed out on every other device.');
        }}>
            <AccessField label="Matric number, staff ID or email" type="text" autoComplete="username" placeholder="AOU/2023/0412" />
            <button type="button" className="btn btn-outline w-full justify-center" onClick={() =>
                notify('Recovery code requested. In the full system the code is sent to the registered channel only.')}>Send recovery code</button>
            <div className="border-t border-ink-100 pt-4">
                <AccessField label="Recovery code" type="text" className="font-mono" inputMode="numeric" placeholder="6 digit code"
                    hint="Valid for 15 minutes from the moment it is issued." />
                <AccessField label="New password" type="password" autoComplete="new-password" placeholder="At least 12 characters"
                    hint="Must differ from the previous password and from any of the last five." />
                <button type="submit" className="btn btn-primary mt-1 w-full justify-center">Set new password</button>
            </div>
        </form>
        <div className="mt-6 space-y-3">
            <AccessNote warning>If the account has a registered second factor, recovery cannot be completed by code alone and the ICT Directorate must verify the requester in person.</AccessNote>
        </div>
        {feedback}
    </AccessFrame>;
}
