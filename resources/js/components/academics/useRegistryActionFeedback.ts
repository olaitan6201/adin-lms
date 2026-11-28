import { useEffect, useState } from 'react';
import { focusRegistryTarget } from './registryFocus';

type Feedback = { message: string; submitId?: string };

export function useRegistryActionFeedback(headingId: string) {
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    useEffect(() => {
        if (!feedback) {
            return;
        }

        const frame = requestAnimationFrame(() => {
            focusRegistryTarget(feedback.submitId ?? headingId, headingId);
        });

        return () => cancelAnimationFrame(frame);
    }, [feedback, headingId]);

    function clearFeedback() {
        setFeedback(null);
    }

    function reportSuccess(message: string, submitId?: string) {
        setFeedback({ message, submitId });
    }

    return { message: feedback?.message ?? '', reportSuccess, clearFeedback };
}
