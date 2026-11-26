import { useEffect, useState, useSyncExternalStore } from 'react';
import type { Sitting } from '@/types/assessments/examPaper';

type Attempt = {
    index: number;
    answers: Record<string, string>;
    flags: string[];
    deadline: number;
    submitted: number | null;
    warned?: boolean;
};

/** A saved receipt identifies the exact revision successfully written to storage. */
function createAttemptPersistence() {
    let saved: Attempt | null = null;
    const listeners = new Set<() => void>();

    return {
        snapshot: () => saved,
        subscribe(listener: () => void) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        persist(key: string, attempt: Attempt) {
            try {
                sessionStorage.setItem(key, JSON.stringify(attempt));
                saved = attempt;
            } catch {
                saved = null;
            }

            for (const listener of listeners) {
                listener();
            }
        },
    };
}

export function readSavedAttempt({ paper, storageKey: key }: Sitting): Attempt | null {
    const ids = paper.map(q => q.id);
    try {
        const v = JSON.parse(sessionStorage.getItem(key) ?? 'null');
        if (v && Number.isFinite(v.deadline) && v.deadline > 0 && Number.isInteger(v.index) && paper[v.index]
            && v.answers && typeof v.answers === 'object' && !Array.isArray(v.answers)
            && Object.entries(v.answers).every(([id, a]) => ids.includes(id) && typeof a === 'string')
            && Array.isArray(v.flags) && v.flags.every((id: unknown) => typeof id === 'string' && ids.includes(id))
            && (v.submitted === null || Number.isFinite(v.submitted))) {
            return v;
        }
    } catch {
        /* An unavailable store still permits an in-memory sitting. */
    }

    return null;
}

function resumeAttempt(sitting: Sitting): Attempt {
    const saved = readSavedAttempt(sitting);
    if (saved) {
        return { ...saved, submitted: saved.submitted ?? (Date.now() >= saved.deadline ? saved.deadline : null) };
    }

    return { index: 0, answers: {}, flags: [], deadline: Date.now() + sitting.minutes * 60_000, submitted: null };
}

export function useExamAttempt(sitting: Sitting) {
    const { paper, storageKey: key } = sitting;
    const [attempt, setAttempt] = useState(() => resumeAttempt(sitting));
    const [showWarning, setShowWarning] = useState(false);
    const [now, setNow] = useState(Date.now);
    const [persistence] = useState(createAttemptPersistence);
    const saved = useSyncExternalStore(persistence.subscribe, persistence.snapshot, () => null);
    const stored = saved === attempt;

    useEffect(() => {
        persistence.persist(key, attempt);
    }, [attempt, key, persistence]);

    useEffect(() => {
        if (attempt.submitted !== null) {
            return;
        }

        function tick() {
            const time = Date.now();
            setNow(time);
            if (time >= attempt.deadline) {
                setAttempt(a => ({ ...a, submitted: a.submitted ?? a.deadline }));
            } else if (!attempt.warned && attempt.deadline - time <= 300_000) {
                setShowWarning(true);
                setAttempt(a => ({ ...a, warned: true }));
            }
        }

        const interval = window.setInterval(tick, 500);
        window.addEventListener('focus', tick);
        return () => {
            window.clearInterval(interval);
            window.removeEventListener('focus', tick);
        };
    }, [attempt.deadline, attempt.submitted, attempt.warned]);

    function update(fn: (a: Attempt) => Attempt) {
        const time = Date.now();
        setAttempt(a => a.submitted !== null ? a : time >= a.deadline ? { ...a, submitted: a.deadline } : fn(a));
    }

    function answer(value: string) {
        update(a => {
            const answers = { ...a.answers };
            const id = paper[a.index].id;
            if (value) {
                answers[id] = value;
            } else {
                delete answers[id];
            }

            return { ...a, answers };
        });
    }

    return {
        attempt, stored, answer, showWarning,
        remaining: Math.max(0, Math.ceil((attempt.deadline - now) / 1000)),
        jump: (index: number) => update(a => ({ ...a, index: Math.max(0, Math.min(index, paper.length - 1)) })),
        flag: () => update(a => {
            const id = paper[a.index].id;
            return { ...a, flags: a.flags.includes(id) ? a.flags.filter(f => f !== id) : [...a.flags, id] };
        }),
        submit: () => update(a => ({ ...a, submitted: Date.now() })),
    };
}
