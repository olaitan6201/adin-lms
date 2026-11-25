import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type Props = { attempt: string; expires: string; answered: number; total: number; pending: boolean };

export function FinalReview({ attempt, expires, answered, total, pending }: Props) {
    const deadline = Date.parse(expires);
    const [expired, setExpired] = useState(() => Date.now() >= deadline);
    const [online, setOnline] = useState(() => navigator.onLine);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const lock = useRef(false);
    const dialog = useRef<HTMLDialogElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        const timer = window.setTimeout(() => setExpired(true), Math.max(0, deadline - Date.now()));
        const update = () => setOnline(navigator.onLine);
        window.addEventListener('online', update);
        window.addEventListener('offline', update);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('online', update);
            window.removeEventListener('offline', update);
        };
    }, [deadline]);

    const reason = expired ? 'The deadline has passed. Reload the paper to see the server’s final status.'
        : !online ? 'You are offline. Reconnect before submitting.'
        : pending ? 'Wait for all answers to save. If a save failed, return to the paper and retry.' : '';
    function submit() {
        if (Date.now() >= deadline) setExpired(true);
        if (reason || !navigator.onLine || Date.now() >= deadline || lock.current) return;
        lock.current = true;
        setSending(true);
        setError('');
        const failed = () => {
            setError('Submission could not be confirmed. Reload to check your attempt before trying again.');
            return false;
        };
        router.post(`/attempts/${attempt}/finish`, {}, {
            onNetworkError: failed, onHttpException: failed, onError: failed,
            onFinish: () => {
                lock.current = false;
                setSending(false);
            },
        });
    }
    return (
        <>
            <button type="button" ref={trigger} aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
                Review final submission
            </button>
            <dialog ref={dialog} aria-labelledby="review-title" aria-describedby="review-summary review-consequence"
                className="m-auto w-[min(28rem,90vw)] rounded-lg border bg-white p-5 shadow-xl backdrop:bg-black/50"
                onCancel={(event) => { if (lock.current) event.preventDefault(); }}
                onClose={() => trigger.current?.focus()}>
                <p className="portal-kicker">Examination paper</p>
                <h2 id="review-title">Review final submission</h2>
                <p id="review-summary">Saved answers: {answered} answered · {total - answered} unanswered.</p>
                <p id="review-consequence" className="my-3">Submitting ends this attempt. You cannot change your answers afterward.</p>
                <p role="status">{error || reason}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" autoFocus disabled={sending} onClick={() => dialog.current?.close()}>Return to paper</button>
                    <button type="button" disabled={Boolean(reason || error) || sending} onClick={submit}>
                        {sending ? 'Submitting…' : 'Submit final answers'}
                    </button>
                </div>
            </dialog>
        </>
    );
}
