import { Head } from '@inertiajs/react';
import PrivacyAction, { type OperationChoice } from '../components/PrivacyAction';
import PrivacyCaseRegister, { type CasePage } from '../components/PrivacyCaseRegister';

export default function PrivacyDesk({ csrf, operations, cases }: { csrf: string; operations: OperationChoice[]; cases: CasePage }) {
    return (
        <main className="mx-auto max-w-2xl space-y-6 px-6 py-12">
            <Head title="Privacy cases" />
            <header>
                <p className="portal-kicker">Institution operations</p>
                <h1 className="portal-title">Privacy cases</h1>
            </header>
            <PrivacyCaseRegister cases={cases} />
            <PrivacyAction mode="approve" csrf={csrf} operations={operations} />
            <PrivacyAction mode="execute" csrf={csrf} operations={operations} />
            <PrivacyAction mode="refer" csrf={csrf} operations={operations} />
        </main>
    );
}
