import type { Learner, RegisterMark, Session } from '@/types/assessments/attendance';

export type Marks = Record<string, RegisterMark>;

export function initialMarks(session: Session, roster: Learner[]): Marks {
    return Object.fromEntries(
        roster.map((learner) => [learner.matric, session.state === 'scheduled' ? '' : learner.mark]),
    );
}

export function applyMarks(session: Session, original: Marks, updated: Marks): Session {
    function adjustedTotal(status: 'present' | 'late' | 'absent') {
        const before = Object.values(original).filter((mark) => mark === status).length;
        const after = Object.values(updated).filter((mark) => mark === status).length;
        return Math.max(0, session[status] + after - before);
    }

    return {
        ...session,
        present: adjustedTotal('present'),
        absent: adjustedTotal('absent'),
        late: adjustedTotal('late'),
        state: session.state === 'scheduled' ? 'open' : session.state,
    };
}
