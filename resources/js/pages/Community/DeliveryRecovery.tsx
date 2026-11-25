import { Link } from '@inertiajs/react';
import { CommunityPage } from '../../components/community/Elements';

type Failure = {
    id: string;
    attempt_count: number;
    last_error_code: string;
};
type Page = {
    data: Failure[];
    next_page_url: string | null;
    prev_page_url: string | null;
};

export default function DeliveryRecovery({ failed }: { failed: Page }) {
    return (
        <CommunityPage title="Failed email deliveries">
            <p>
                Inbox notices are preserved. Once the mail service is available, retry a delivery to return it to the
                next dispatch run.
            </p>
            {!failed.data.length && <p>No failed deliveries on this page.</p>}
            <ul>
                {failed.data.map((row) => (
                    <li key={row.id} className="space-y-2 border-b py-4">
                        <strong>Email delivery {row.id.slice(-8)}</strong>
                        <p>
                            {row.attempt_count} attempts ·{' '}
                            {row.last_error_code === 'mail_transport_failed'
                                ? 'Mail transport unavailable'
                                : 'Delivery failed'}
                        </p>
                        <Link
                            as="button"
                            method="post"
                            href={`/community/delivery-failures/${row.id}`}
                            className="underline"
                        >
                            Retry delivery {row.id.slice(-8)}
                        </Link>
                    </li>
                ))}
            </ul>
            <nav aria-label="Failure pages" className="flex gap-4">
                {failed.prev_page_url && (
                    <Link className="underline" href={failed.prev_page_url}>
                        Previous
                    </Link>
                )}
                {failed.next_page_url && (
                    <Link className="underline" href={failed.next_page_url}>
                        Next
                    </Link>
                )}
            </nav>
        </CommunityPage>
    );
}
