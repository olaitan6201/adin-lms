import { useEffect, useState } from 'react';
import { observeVisibility } from './observeVisibility';

export type IntegrityPolicy = {
    observe_visibility?: boolean;
    prevent_copy?: boolean;
};

export function IntegrityNotice({
    policy,
    active,
    attempt,
}: {
    policy: IntegrityPolicy;
    active: boolean;
    attempt: string;
}) {
    const [unconfirmed, setUnconfirmed] = useState<string | null>(null);
    useEffect(() => {
        if (!active || !policy.observe_visibility) {
            return;
        }

        return observeVisibility(attempt, () => setUnconfirmed(attempt));
    }, [active, attempt, policy.observe_visibility]);
    return (
        <aside aria-label="Exam conditions" className="space-y-2 rounded-md bg-muted p-4 text-sm">
            <h2 className="font-semibold">Exam conditions</h2>
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
            {active && policy.observe_visibility && unconfirmed === attempt && (
                <p role="status">
                    Delivery of a page visibility signal could not be confirmed. This does not affect your
                    mark.
                </p>
            )}
        </aside>
    );
}
