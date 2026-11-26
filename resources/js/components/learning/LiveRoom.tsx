import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import { Card, Table } from '@/components/workspace/Elements';
import { StudyIcon } from '@/components/learning/Parts';

export function LiveRoom() {
    return (
        <Card title="Live room preview" subtitle="Screen sharing with live question and answer, plus attendance and participation capture">
            <div className="overflow-hidden rounded-xl border border-ink-200 bg-ink-900">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        <span className="text-[12.5px] font-medium text-white">Tutorial: consolidation of accounts</span>
                    </div>
                    <span className="font-mono text-[12px] text-ink-300">00:42:18</span>
                </div>
                <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <div className="grid-paper flex aspect-video items-center justify-center rounded-lg bg-ink-800">
                            <div className="text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
                                    <StudyIcon name="monitor" className="w-6 h-6" />
                                </div>
                                <p className="mt-3 text-[13px] font-medium text-white">Dr. Peter Adeyemi is presenting</p>
                                <p className="mt-1 text-[11.5px] text-ink-400">Slide 14 of 38 · consolidation of subsidiary books</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="rounded-lg bg-white/5 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Questions</p>
                            <ul className="mt-2 space-y-2">
                                <li className="rounded-md bg-white/5 p-2 text-[12px] leading-relaxed text-ink-200">
                                    How do we treat the intercompany dividend?
                                </li>
                                <li className="rounded-md bg-white/5 p-2 text-[12px] leading-relaxed text-ink-200">
                                    Is the elimination entry the same for both years?
                                </li>
                            </ul>
                        </div>
                        <div className="rounded-lg bg-white/5 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Present</p>
                            <p className="mt-1 text-lg font-semibold text-white tnum">47</p>
                            <p className="mt-0.5 text-[11.5px] text-ink-400">of 68 enrolled joined</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-4 py-2.5">
                    <button type="button" className="btn btn-sm border-white/10 bg-white/10 text-white hover:bg-white/15">
                        <StudyIcon name="mic" className="w-4 h-4" />
                        <span>Mute</span>
                    </button>
                    <button type="button" className="btn btn-sm border-white/10 bg-white/10 text-white hover:bg-white/15">
                        <StudyIcon name="monitor" className="w-4 h-4" />
                        <span>Share screen</span>
                    </button>
                    <button type="button" className="btn btn-sm border-white/10 bg-white/10 text-white hover:bg-white/15">
                        <StudyIcon name="chat" className="w-4 h-4" />
                        <span>Questions</span>
                    </button>
                    <button type="button" className="btn btn-sm border-white/10 bg-white/10 text-white hover:bg-white/15">
                        <StudyIcon name="camera" className="w-4 h-4" />
                        <span>Record</span>
                    </button>
                    <span className="ml-auto text-[11.5px] text-ink-400">Attendance and participation are captured automatically</span>
                </div>
            </div>
        </Card>
    );
}
export function Recordings() {
    const { notify } = useWorkspaceOverlays();
    const recordings = [
        { title: 'Practical briefing: titration', course: 'CHM401', date: '12 Nov 2026', length: '1:58:22', views: 38 },
        { title: 'Tutorial: journal entries and ledgers', course: 'ACC302', date: '05 Nov 2026', length: '1:12:05', views: 61 },
        { title: 'Workshop: narrative voice', course: 'ENG210', date: '29 Oct 2026', length: '1:44:37', views: 74 },
    ];

    const rows = recordings.map((recording) => [
        <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
                <StudyIcon name="video" className="w-4 h-4" />
            </span>
            <div className="min-w-0">
                <p className="truncate font-medium text-ink-800">{recording.title}</p>
                <p className="truncate text-[11px] text-ink-400">
                    {recording.course} · {recording.date}
                </p>
            </div>
        </div>,
        <span className="font-mono text-[12px] text-ink-600">{recording.length}</span>,
        <span className="text-[13px] tnum">{recording.views}</span>,
        <div className="flex justify-end gap-1.5">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => notify('Transcript opened')}>
                Transcript
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => notify('Recording attached to Week 3')}>
                Attach
            </button>
        </div>,
    ]);

    return (
        <Card
            className="[&_th:last-child]:w-[180px]" title="Recordings and asynchronous material"
            subtitle="Linked to the module they belong to, with transcripts where captions are available"
        >
            <Table columns={['Recording', 'Length', 'Views', '']} rows={rows} />
        </Card>
    );
}
