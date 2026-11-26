import { Head } from '@inertiajs/react';
import PrivacyAction, { type OperationChoice } from '../components/PrivacyAction';
import PrivacyCaseRegister, { type CasePage } from '../components/PrivacyCaseRegister';
import { DeskHeading } from '@/components/academics/DeskHeading';

export default function PrivacyDesk({ csrf, operations, cases }: { csrf: string; operations: OperationChoice[]; cases: CasePage }) {
    return (
        <main className="w-full min-w-0 space-y-5 wrap-anywhere">
            <Head title="Privacy cases" />
            <DeskHeading area="Institution operations" title="Privacy cases">Open a case, review its decisions and record the outcome.</DeskHeading>
            <div className="grid items-start gap-5 xl:grid-cols-[3fr_2fr]">
            <PrivacyCaseRegister cases={cases} />
            <div className="min-w-0 space-y-5">
            <PrivacyAction mode="approve" csrf={csrf} operations={operations} />
            <PrivacyAction mode="execute" csrf={csrf} operations={operations} />
            <PrivacyAction mode="refer" csrf={csrf} operations={operations} />
            </div>
            </div>
        </main>
    );
}
