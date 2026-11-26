import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type Props = {
    attempt: string;
    expires: string;
    answered: number;
    total: number;
    pending: boolean;
};

export function FinalReview({ attempt, expires, answered, total, pending }: Props) {
    const deadline = Date.parse(expires);
    const [expired, setExpired] = useState(() => Date.now() >= deadline);
    const [online, setOnline] = useState(() => navigator.onLine);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const lock = useRef(false);
    const [open, setOpen] = useState(false);
    const returnButton = useRef<HTMLButtonElement>(null);
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

    const reason = expired
        ? 'The deadline has passed. Reload the paper to see the server’s final status.'
        : !online
          ? 'You are offline. Reconnect before submitting.'
          : pending
            ? 'Wait for all answers to save. If a save failed, return to the paper and retry.'
            : '';
    function submit() {
        if (Date.now() >= deadline) {
            setExpired(true);
        }

        if (reason || !navigator.onLine || Date.now() >= deadline || lock.current) {
            return;
        }

        lock.current = true;
        setSending(true);
        setError('');
        const failed = () => {
            setError('Submission could not be confirmed. Reload to check your attempt before trying again.');
            return false;
        };

        router.post(
            `/attempts/${attempt}/finish`,
            {},
            {
                onNetworkError: failed,
                onHttpException: failed,
                onError: failed,
                onFinish: () => {
                    lock.current = false;
                    setSending(false);
                },
            },
        );
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!lock.current) {
                    setOpen(next);
                }
            }}
        >
            <DialogTrigger asChild>
                <Button type="button">Review final submission</Button>
            </DialogTrigger>
            <DialogContent
                showCloseButton={false}
                onOpenAutoFocus={(event) => {
                    event.preventDefault();
                    returnButton.current?.focus();
                }}
            >
                <DialogHeader>
                    <DialogTitle>Review final submission</DialogTitle>
                    <DialogDescription>
                        <span id="review-summary" className="block">
                            Saved answers: {answered} answered · {total - answered} unanswered.
                        </span>
                        <span id="review-consequence" className="mt-2 block">
                            Submitting ends this attempt. You cannot change your answers afterward.
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <p role="status" className="text-sm empty:hidden">
                    {error || reason}
                </p>
                <DialogFooter className="flex-col">
                    <DialogClose asChild>
                        <Button
                            ref={returnButton}
                            variant="outline"
                            type="button"
                            aria-describedby="review-summary review-consequence"
                            disabled={sending}
                        >
                            Return to paper
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        type="button"
                        disabled={Boolean(reason || error) || sending}
                        onClick={submit}
                    >
                        {sending ? 'Submitting…' : 'Submit final answers'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
