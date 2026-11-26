import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/layout/Card';
import { StudyIcon } from '@/components/learning/Parts';

export function SessionDrawer({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
    const { notify } = useWorkspaceOverlays();
    const closeSession = () => setOpen(false);
    const panel = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        if (open) {
            panel.current?.showModal();
        } else {
            panel.current?.close();
        }
    }, [open]);
    return (
        <dialog ref={panel} inert={!open} aria-labelledby="session-title" aria-describedby="session-description" className="learning-session"
            onCancel={closeSession} onClick={event => {
                if (event.target === panel.current && event.clientX < panel.current.getBoundingClientRect().left) closeSession();
            }}>
            <div className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
                <div>
                    <h3 id="session-title" className="text-[15px] font-semibold text-ink-900">Tutorial: consolidation of accounts</h3>
                    <p id="session-description" className="mt-0.5 text-[13px] text-ink-500">ACC302 · Today, 16:00 · 60 minutes</p>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={closeSession} aria-label="Close panel">
                    <StudyIcon name="close" className="h-4 w-4" />
                </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5" data-scroll>
                <Card title="Session definition">
                    <div className="space-y-3">
                        <label className="block">
                            <span className="label">Title</span>
                            <input className="input" defaultValue="Tutorial: consolidation of accounts" />
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="label">Date</span>
                                <input className="input" type="date" defaultValue="2026-11-26" />
                            </label>
                            <label className="block">
                                <span className="label">Start time</span>
                                <input className="input" type="time" defaultValue="16:00" />
                            </label>
                        </div>
                        <label className="block">
                            <span className="label">Duration</span>
                            <select className="select">
                                <option>60 minutes</option>
                                <option>90 minutes</option>
                                <option>120 minutes</option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="label">Meeting link</span>
                            <input className="input" defaultValue="Issued to enrolled students 15 minutes before start" readOnly />
                        </label>
                        <label className="block">
                            <span className="label">Announcement</span>
                            <select className="select">
                                <option>Send to enrolled students and to guardians with consent</option>
                                <option>Enrolled students only</option>
                            </select>
                        </label>
                    </div>
                </Card>
                <Card title="Attendance capture">
                    <div className="flex items-center gap-3 rounded-xl border border-ink-100 p-3.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                            <StudyIcon name="qr" className="w-4 h-4" />
                        </span>
                        <div>
                            <p className="text-[13px] font-semibold text-ink-800">QR check-in enabled</p>
                            <p className="mt-0.5 text-xs text-ink-500">Manual register remains available as a fallback</p>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="flex justify-end gap-2 border-t border-ink-100 p-4">
                <button type="button" className="btn btn-outline" onClick={closeSession}>
                    Close
                </button>
                <button type="button" className="btn btn-primary" onClick={() => notify('Class scheduled and announcement queued')}>
                    Save and announce
                </button>
            </div>
        </dialog>
    );
}
