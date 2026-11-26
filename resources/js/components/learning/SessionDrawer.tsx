import type { ClassSession, SessionDraft } from '@/types/learning/study';
import { SessionDefinition } from './SessionDefinition';
import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/layout/Card';
import { StudyIcon } from '@/components/learning/Parts';

export type ClassroomSelection = {
    kind: 'details';
    sessionId: string;
} | { kind: 'schedule' };

type Props = {
    selection: ClassroomSelection;
    session?: ClassSession;
    open: boolean;
    closeSession: () => void;
    save: (draft: SessionDraft) => void;
};

export function SessionDrawer({ selection, session, open, closeSession, save }: Props) {
    const scheduling = selection.kind === 'schedule';
    const editable = scheduling || Boolean(session?.details);
    const title = scheduling ? 'Schedule class' : (session?.title ?? 'Session unavailable');
    const summary = scheduling
        ? 'Define a new classroom session.'
        : session && `${session.course} · ${session.starts} · ${session.duration}`;
    const panel = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        if (open) {
            panel.current?.showModal();
        } else {
            panel.current?.close();
        }
    }, [open]);
    return (
        <dialog
            ref={panel}
            inert={!open}
            aria-labelledby="session-title"
            aria-describedby="session-description"
            className="learning-session"
            onCancel={closeSession}
            onClick={(event) => {
                if (event.target === panel.current && event.clientX < panel.current.getBoundingClientRect().left)
                    closeSession();
            }}
        >
            <div className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
                <div>
                    <h3 id="session-title" className="text-[15px] font-semibold text-ink-900">
                        {title}
                    </h3>
                    <p id="session-description" className="mt-0.5 text-[13px] text-ink-500">
                        {summary}
                    </p>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={closeSession} aria-label="Close panel">
                    <StudyIcon name="close" className="h-4 w-4" />
                </button>
            </div>
            <div
                key={scheduling ? 'schedule' : session?.id}
                className="flex-1 space-y-4 overflow-y-auto p-5"
                data-scroll
            >
                {!editable && <p>No session definition is available for this class.</p>}
                {open && editable && <SessionDefinition session={session} save={save} />}
                {session?.details?.checkin && (
                    <Card title="Attendance capture">
                        <div className="flex items-center gap-3 rounded-xl border border-ink-100 p-3.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                                <StudyIcon name="qr" className="w-4 h-4" />
                            </span>
                            <div>
                                <p className="text-[13px] font-semibold text-ink-800">{session.details.checkin}</p>
                                <p className="mt-0.5 text-xs text-ink-500">
                                    Manual register remains available as a fallback
                                </p>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
            <div className="flex justify-end gap-2 border-t border-ink-100 p-4">
                <button type="button" className="btn btn-outline" onClick={closeSession}>
                    Close
                </button>
                {editable && (
                    <button type="submit" form="classroom-definition" className="btn btn-primary">
                        Save locally
                    </button>
                )}
            </div>
        </dialog>
    );
}
