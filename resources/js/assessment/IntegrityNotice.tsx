import { useEffect } from 'react';

export type IntegrityPolicy = { observe_visibility?: boolean; prevent_copy?: boolean };

export function IntegrityNotice({
    policy,
    active,
    attempt,
}: {
    policy: IntegrityPolicy;
    active: boolean;
    attempt: string;
}) {
    useEffect(() => {
        if (!active || !policy.observe_visibility) return;
        const changed = () => {
            if (!document.hidden) return;
            const token = decodeURIComponent(document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/)?.[1] ?? '');
            void fetch(`/attempts/${attempt}/visibility-signal`, {
                method: 'POST',
                keepalive: true,
                headers: { Accept: 'application/json', 'X-XSRF-TOKEN': token },
            }).catch(() => {});
        };
        document.addEventListener('visibilitychange', changed);
        return () => document.removeEventListener('visibilitychange', changed);
    }, [active, attempt, policy.observe_visibility]);
    return (
        <aside aria-label="Exam conditions">
            {policy.observe_visibility && (
                <p>
                    This exam records when the page becomes hidden. Your lecturer reviews the context; a
                    signal never changes your mark.
                </p>
            )}
            {policy.prevent_copy && (
                <p>Copying from this paper is disabled in supported browsers while the attempt is open.</p>
            )}
            <p>This browser cannot identify who is present, monitor other apps or detect another device.</p>
        </aside>
    );
}
