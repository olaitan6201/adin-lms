import { Form, Head } from '@inertiajs/react';

type ConsentProps = {
    granted: boolean;
    notice: string;
};

export default function OperationsConsent({ granted, notice }: ConsentProps) {
    return (
        <main className="mx-auto max-w-2xl space-y-4 px-6 py-12">
            <Head title="Feedback consent" />
            <h1 className="text-3xl font-semibold">Optional course feedback</h1>
            <p>
                Notice {notice}: You may allow the institution to invite you to give course feedback. This is optional
                and does not affect your registration, access or grades. You can withdraw here.
            </p>
            <p>Current choice: {granted ? 'Consent granted' : 'No active consent'}</p>
            <Form method="post" action="/operations/consent">
                {({ processing, recentlySuccessful, errors }) => (
                    <>
                        <input type="hidden" name="notice" value={notice} />
                        <input type="hidden" name="grant" value={granted ? '0' : '1'} />
                        <button disabled={processing} className="bg-teal-900 p-2 text-white">
                            {granted ? 'Withdraw consent' : 'Give consent'}
                        </button>
                        {recentlySuccessful && <p role="status">Choice saved.</p>}
                        {Object.keys(errors).length > 0 && <p role="alert">{Object.values(errors)[0]}</p>}
                    </>
                )}
            </Form>
        </main>
    );
}
