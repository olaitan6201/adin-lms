import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import { StudyIcon } from '@/components/learning/Parts';

export function LessonResources() {
    const { notify } = useWorkspaceOverlays();
    return (
        <>
            <section>
                <h3 className="text-[14px] font-semibold text-ink-900">Exercises and revision</h3>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        className="flex items-center gap-3 rounded-xl border border-ink-100 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft"
                        onClick={() => notify('Exercise set opened')}
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
                            <StudyIcon name="clipboard" className="w-4 h-4" />
                        </span>
                        <span>
                            <span className="block text-[13px] font-medium text-ink-800">Exercise set 3.1</span>
                            <span className="mt-0.5 block text-xs text-ink-500">8 questions · attempt now</span>
                        </span>
                    </button>
                    <button
                        type="button"
                        className="flex items-center gap-3 rounded-xl border border-ink-100 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft"
                        onClick={() => notify('Quiz opened')}
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
                            <StudyIcon name="timer" className="w-4 h-4" />
                        </span>
                        <span>
                            <span className="block text-[13px] font-medium text-ink-800">Topic quiz</span>
                            <span className="mt-0.5 block text-xs text-ink-500">10 objective items · 15 min</span>
                        </span>
                    </button>
                </div>
            </section>

            <section>
                <h3 className="text-[14px] font-semibold text-ink-900">Embedded external reading</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
                    An external resource is embedded in the lesson and opens with the lesson rather than sending the student away from the
                    course.
                </p>
                <div className="mt-3 overflow-hidden rounded-xl border border-ink-100">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-ink-50/70 px-4 py-2.5">
                        <span className="flex items-center gap-2">
                            <StudyIcon name="link" className="h-4 w-4 text-brand-600" />
                            <span className="text-[12.5px] font-medium text-ink-800">IFRS Foundation: IAS 2 Inventories</span>
                        </span>
                        <span className="font-mono text-[11px] text-ink-500">external link · ifrs.org</span>
                    </div>
                    <div className="p-4">
                        <p className="text-[13px] leading-relaxed text-ink-600">
                            Embedded summary of the measurement and cost formula requirements, read alongside Week 4 on inventory valuation. The
                            embedded copy is a read-only capture; the live text always opens in a new tab.
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => notify('External reading opened in a new tab')}
                            >
                                <StudyIcon name="external" className="w-4 h-4" />
                                <span>Open the live text</span>
                            </button>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => notify('External reading saved for offline use')}
                            >
                                <StudyIcon name="download" className="w-4 h-4" />
                                <span>Save offline</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-[14px] font-semibold text-ink-900">Resources for this week</h3>
                <ul className="mt-2 divide-y divide-ink-100 rounded-xl border border-ink-100">
                    {[
                        { name: 'Week 3 manuscript: journals and ledgers', type: 'PDF', size: '3.2 MB', icon: 'document' },
                        { name: 'Practice set with worked solutions', type: 'DOCX', size: '860 KB', icon: 'document' },
                        { name: 'Trial balance template', type: 'XLSX', size: '124 KB', icon: 'sheet' },
                        { name: 'Audio summary: the accounting cycle', type: 'MP3', size: '18.6 MB', icon: 'mic' },
                        { name: 'IFRS 15 guidance: external reading', type: 'Link', size: 'External URL', icon: 'link' },
                    ].map((resource) => (
                        <li key={resource.name} className="flex items-center gap-3 px-3.5 py-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
                                <StudyIcon name={resource.icon} className="w-4 h-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13px] font-medium text-ink-800">{resource.name}</span>
                                <span className="mt-0.5 block text-[11.5px] text-ink-400">
                                    {resource.type} · {resource.size}
                                </span>
                            </span>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => notify(`${resource.name} saved for offline use`)}
                                aria-label={`Download ${resource.name}`}
                            >
                                <StudyIcon name="download" className="w-4 h-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
        </>
    );
}
