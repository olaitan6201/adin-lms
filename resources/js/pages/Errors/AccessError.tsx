import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { FileQuestionMark, ShieldAlert } from 'lucide-react';
import { RecordHeading } from '@/components/shared/records/WorkspaceRecord';

type AccessErrorProps = {
    status: 403 | 404;
    returnTo: string;
};

const explanations = {
    403: {
        title: 'This action is restricted',
        detail: 'Your account does not have access to this action. Return to the portal to see the work available to you.',
    },
    404: {
        title: 'This page is unavailable',
        detail: 'The link may be out of date, or the activity may not be available in your current courses.',
    },
} as const;

export default function AccessError({ status, returnTo }: AccessErrorProps) {
    const message = explanations[status];
    const Icon = status === 403 ? ShieldAlert : FileQuestionMark;

    return (
        <main className="card card-pad mx-auto grid w-full max-w-2xl justify-items-start gap-5 wrap-anywhere">
            <Head title={message.title} />
            <span className="rounded-lg bg-amber-50 p-3 text-amber-800">
                <Icon aria-hidden="true" size={24} />
            </span>
            <RecordHeading area={`Learning portal · ${status}`} title={message.title} description={message.detail} />
            <Button asChild>
                <Link href={returnTo}>Return to the portal</Link>
            </Button>
        </main>
    );
}
