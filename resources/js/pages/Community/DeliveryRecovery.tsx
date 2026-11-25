import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form, Link } from '@inertiajs/react';
import { useState } from 'react';
import { CommunityPage } from '../../components/community/Elements';

type Failure = { id: string; attempt_count: number; last_error_code: string };
type Page = { data: Failure[]; next_page_url: string | null; prev_page_url: string | null };

function DeliveryRow({ row, onRecovered }: { row: Failure; onRecovered: (id: string) => void }) {
    const [error, setError] = useState('');
    const reference = row.id.slice(-8);
    const fail = () => {
        setError('Retry not confirmed. Refresh this list to check the delivery before trying again.');
        return false;
    };

    return (
        <li className="grid gap-2 py-4">
            <h2 className="font-semibold">Email delivery {reference}</h2>
            <p>{row.attempt_count} attempts · {row.last_error_code === 'mail_transport_failed'
                ? 'Mail transport unavailable' : 'Delivery failed'}</p>
            <Form method="post" action={`/community/delivery-failures/${row.id}`} options={{ preserveScroll: true }}
                onStart={() => setError('')} onError={fail} onNetworkError={fail} onHttpException={fail}
                onSuccess={() => onRecovered(reference)}>
                {({ processing }) => (
                    <Button type="submit" variant="outline" disabled={processing} aria-busy={processing}>
                        {processing ? 'Retrying delivery' : 'Retry delivery'} {reference}
                    </Button>
                )}
            </Form>
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        </li>
    );
}

export default function DeliveryRecovery({ failed }: { failed: Page }) {
    const [confirmed, setConfirmed] = useState('');

    return (
        <CommunityPage title="Failed email deliveries">
            <p>Inbox notices are preserved. Once the mail service is available, retry a delivery to return it to the next dispatch run.</p>
            <p role="status">{confirmed && `Delivery ${confirmed} is no longer on the failed list.`}</p>
            {failed.data.length ? (
                <ul className="divide-y">
                    {failed.data.map(row => <DeliveryRow key={row.id} row={row} onRecovered={setConfirmed} />)}
                </ul>
            ) : <p>No failed deliveries on this page.</p>}
            <nav aria-label="Failure pages" className="flex flex-wrap gap-2">
                {failed.prev_page_url && <Button variant="outline" asChild><Link href={failed.prev_page_url}>Previous</Link></Button>}
                {failed.next_page_url && <Button variant="outline" asChild><Link href={failed.next_page_url}>Next</Link></Button>}
            </nav>
        </CommunityPage>
    );
}
