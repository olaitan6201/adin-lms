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
        <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 wrap-anywhere px-4 py-6 sm:px-6 lg:px-8">
            <Head title={message.title} />
            <p className="text-sm font-medium text-muted-foreground">Learning portal · {status}</p>
            <h1 className="break-words text-3xl font-semibold tracking-tight">{message.title}</h1>
            <p className="my-6 max-w-prose">{message.detail}</p>
            <Button asChild>
                <Link href={returnTo}>
                    Return to the portal
                </Link>
            </Button>
        </main>
    );
}
