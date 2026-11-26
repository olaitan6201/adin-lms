import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import { Drawer } from '@/components/workspace/Panels';
import { Card } from '@/components/workspace/Elements';
import { StudyIcon } from '@/components/learning/Parts';

export function SessionDrawer({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
    const { notify } = useWorkspaceOverlays();
    const closeSession = () => setOpen(false);
    return (
        <Drawer title="Tutorial: consolidation of accounts" description="ACC302 · Today, 16:00 · 60 minutes" open={open} onOpenChange={setOpen}>
            <div className="space-y-4">
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
        </Drawer>
    );
}
