import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';

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

    return (
        <main className="portal-page">
            <Head title={message.title} />
            <p className="portal-kicker">Learning portal · {status}</p>
            <h1 className="portal-title">{message.title}</h1>
            <p className="my-6 max-w-prose">{message.detail}</p>
            <Button asChild>
                <Link href={returnTo}>
                    Return to the portal
                </Link>
            </Button>
        </main>
    );
}
