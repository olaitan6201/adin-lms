import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PrivacyCaseRegister, { type CasePage } from '../components/PrivacyCaseRegister';

type OperationChoice = {
    value: string;
    label: string;
};

type PrivacyDeskProps = {
    csrf: string;
    operations: OperationChoice[];
    cases: CasePage;
};

function CaseReference({ label }: { label: string }) {
    return (
        <label>
            {label} <input required className="border p-2" name="reference" pattern="[A-Za-z0-9_-]{1,64}" />
        </label>
    );
}

export default function PrivacyDesk({ csrf, operations, cases }: PrivacyDeskProps) {
    const [subject, setSubject] = useState('');
    const [approval, setApproval] = useState('');
    const errors = usePage().props.errors;
    const url = `/operations/privacy/${encodeURIComponent(subject)}`;

    return (
        <main className="mx-auto max-w-2xl space-y-4 px-6 py-12">
            <Head title="Privacy cases" />
            <h1 className="text-3xl font-semibold">Privacy cases</h1>
            {Object.values(errors).map((value, index) => (
                <p key={index} role="alert">
                    {String(value)}
                </p>
            ))}
            <p>Verify identity, authority and holds in the institution's case system. Use only its reference here.</p>
            <PrivacyCaseRegister cases={cases} />
            <label>
                Subject account UUID
                <input
                    className="block w-full border p-2"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />
            </label>
            <form method="post" action={`${url}/approvals`} className="grid gap-2">
                <h2>Record approval</h2>
                <input type="hidden" name="_token" value={csrf} />
                <CaseReference label="Case reference" />
                <label>
                    Scope{' '}
                    <select className="block w-full min-w-0 rounded border p-2" name="operation">
                        {operations.map((operation) => (
                            <option key={operation.value} value={operation.value}>
                                {operation.label}
                            </option>
                        ))}
                    </select>
                </label>
                <button disabled={!subject} className="bg-teal-900 p-2 text-white">
                    Create approval receipt
                </button>
            </form>
            <form method="post" action={`${url}/execute/${encodeURIComponent(approval)}`} className="grid gap-2">
                <h2>Execute approval</h2>
                <input type="hidden" name="_token" value={csrf} />
                <p>A different authorised operator must execute the recorded action within 24 hours.</p>
                <label>
                    Approval UUID
                    <input
                        required
                        className="block w-full border p-2"
                        value={approval}
                        onChange={(e) => setApproval(e.target.value)}
                    />
                </label>
                <button disabled={!subject || !approval} className="bg-teal-900 p-2 text-white">
                    Execute recorded action
                </button>
            </form>
            <form method="post" action="/operations/privacy/incidents" className="grid gap-2">
                <h2>Record incident referral</h2>
                <input type="hidden" name="_token" value={csrf} />
                <p>
                    Contact the designated privacy lead first. This records the case reference; it does not send an
                    alert.
                </p>
                <CaseReference label="Incident reference" />
                <button className="bg-teal-900 p-2 text-white">Record referral</button>
            </form>
        </main>
    );
}
