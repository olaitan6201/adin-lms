type Pending = { id: string; sends: number };
const maxSends = 4;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function restore(key: string): Pending | null {
    try {
        const value = JSON.parse(sessionStorage.getItem(key) ?? 'null');
        if (
            typeof value?.id === 'string' &&
            uuid.test(value.id) &&
            Number.isInteger(value.sends) &&
            value.sends >= 0 &&
            value.sends <= maxSends
        )
            return value;
    } catch {
        /* Storage is optional. */
    }
    return null;
}

// Coalesce transitions while an acknowledgement is outstanding. Persist only
// this tab's attempt-scoped random receipt and its cumulative delivery budget.
export function observeVisibility(attempt: string, unconfirmed: () => void) {
    const key = `exam-visibility:${attempt}`;
    let pending = restore(key);
    let sending = false;
    let stopped = false;
    let terminal = false;
    let timer: number | undefined;

    const remember = (value: Pending | null) => {
        pending = value;
        try {
            if (value) {
                sessionStorage.setItem(key, JSON.stringify(value));
            } else {
                sessionStorage.removeItem(key);
            }
        } catch {
            /* In-memory delivery still works. */
        }
    };

    const deliver = async () => {
        if (!pending || sending || stopped || terminal || timer !== undefined) {
            return;
        }
        if (pending.sends >= maxSends) {
            remember(null);
            unconfirmed();
            return;
        }
        if (!navigator.onLine) {
            return;
        }
        sending = true;
        const receipt = { id: pending.id, sends: pending.sends + 1 };
        let retryDelay = 2000 * 2 ** (receipt.sends - 1);
        remember(receipt);
        try {
            const token = decodeURIComponent(document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/)?.[1] ?? '');
            const response = await fetch(`/attempts/${attempt}/visibility-signal`, {
                method: 'POST',
                keepalive: true,
                redirect: 'error',
                signal: AbortSignal.timeout(10000),
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': token,
                },
                body: JSON.stringify({ observation_id: receipt.id }),
            });
            if (stopped) {
                return;
            }
            if (response.status === 204) {
                remember(null);
            } else if (response.status === 429) {
                const seconds = Number(response.headers.get('Retry-After'));
                if (Number.isFinite(seconds)) {
                    retryDelay = Math.max(retryDelay, Math.min(seconds, 120) * 1000);
                }
            } else if (response.status < 500 && ![408, 429].includes(response.status)) {
                terminal = true;
                remember(null);
                unconfirmed();
            }
        } catch {
            /* An ambiguous acknowledgement must reuse the receipt. */
        } finally {
            sending = false;
            if (!stopped && pending) {
                if (receipt.sends >= maxSends) {
                    remember(null);
                    unconfirmed();
                } else {
                    timer = window.setTimeout(() => {
                        timer = undefined;
                        void deliver();
                    }, retryDelay);
                }
            }
        }
    };

    const changed = () => {
        if (terminal) {
            return;
        }
        if (document.hidden && !pending) {
            remember({ id: crypto.randomUUID(), sends: 0 });
        }
        void deliver();
    };
    document.addEventListener('visibilitychange', changed);
    window.addEventListener('online', deliver);
    void deliver();
    return () => {
        stopped = true;
        window.clearTimeout(timer);
        document.removeEventListener('visibilitychange', changed);
        window.removeEventListener('online', deliver);
    };
}
