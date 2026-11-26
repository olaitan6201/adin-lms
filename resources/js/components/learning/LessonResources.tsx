import type { Practice } from '@/types/learning/lesson';
import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import { StudyIcon } from '@/components/learning/Parts';

export function LessonResources({ practice }: { practice: Practice }) {
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
                            <span className="block text-[13px] font-medium text-ink-800">{practice.exercise}</span>
                            <span className="mt-0.5 block text-xs text-ink-500">{practice.exerciseMeta}</span>
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
                            <span className="block text-[13px] font-medium text-ink-800">{practice.quiz}</span>
                            <span className="mt-0.5 block text-xs text-ink-500">{practice.quizMeta}</span>
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
                            <span className="text-[12.5px] font-medium text-ink-800">{practice.readingTitle}</span>
                        </span>
                        <span className="font-mono text-[11px] text-ink-500">{practice.readingSource}</span>
                    </div>
                    <div className="p-4">
                        <p className="text-[13px] leading-relaxed text-ink-600">{practice.readingSummary}</p>
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
                    {practice.resources.map((resource) => (
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
