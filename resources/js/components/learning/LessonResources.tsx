import { Icon } from '@/components/icons/Icon';
import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import { download } from '@/lib/download';
import type { Practice } from '@/types/learning/lesson';
import { SampleDownload } from './SampleDownload';
import type { StudyFile } from './deviceFiles';

const ias2 = 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/';
const ifrs15 = 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/';

function PracticeTile({ icon, title, detail, open }: {
    icon: string;
    title: string;
    detail: string;
    open: () => void;
}) {
    return (
        <button
            type="button"
            className="flex items-center gap-3 rounded-xl border border-ink-100 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft"
            onClick={open}
        >
            <span className="flex size-9 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
                <Icon name={icon} className="size-4" />
            </span>
            <span>
                <span className="block text-[13px] font-medium text-ink-800">{title}</span>
                <span className="mt-0.5 block text-xs text-ink-500">{detail}</span>
            </span>
        </button>
    );
}

function ExternalReading({ practice }: { practice: Practice }) {
    return (
        <section>
            <h3 className="text-[14px] font-semibold text-ink-900">Embedded external reading</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
                Read the lesson summary here. The live standard opens in a new tab.
            </p>
            <div className="mt-3 overflow-hidden rounded-xl border border-ink-100">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-ink-50/70 px-4 py-2.5">
                    <span className="flex items-center gap-2">
                        <Icon name="link" className="size-4 text-brand-600" />
                        <span className="text-[12.5px] font-medium text-ink-800">{practice.readingTitle}</span>
                    </span>
                    <span className="font-mono text-[11px] text-ink-500">{practice.readingSource}</span>
                </div>
                <div className="p-4">
                    <p className="text-[13px] leading-relaxed text-ink-600">{practice.readingSummary}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <a
                            className="btn btn-outline btn-sm"
                            href={ias2}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Icon name="external" className="size-4" />
                            <span>Open the live text</span>
                        </a>
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => download('ias-2-reading-note.txt', practice.readingSummary, 'text/plain')}
                        >
                            <Icon name="download" className="size-4" />
                            <span>Save reading note</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function WeeklyResources({ resources, materials }: {
    resources: Practice['resources'];
    materials: readonly StudyFile[];
}) {
    return (
        <section>
            <h3 className="text-[14px] font-semibold text-ink-900">Resources for this week</h3>
            <ul className="mt-2 divide-y divide-ink-100 rounded-xl border border-ink-100">
                {resources.map(resource => {
                    const file = materials.find(item => item.format === resource.type);
                    const reading = resource.type === 'Link';
                    return (
                        <li key={resource.name} className="flex items-center gap-3 px-3.5 py-3">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
                                <Icon name={resource.icon} className="size-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13px] font-medium text-ink-800">{resource.name}</span>
                                <span className="mt-0.5 block text-[11.5px] text-ink-400">
                                    {resource.type} · {file ? `${Math.ceil(file.bytes / 1024)} KB` : reading ? resource.size : 'Unavailable in this sample'}
                                </span>
                            </span>
                            {file && <SampleDownload file={file} label={`Download ${resource.name}`} appearance="icon" />}
                            {reading && (
                                <a
                                    href={ifrs15}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-ghost btn-sm"
                                    aria-label={`Open ${resource.name}`}
                                >
                                    <Icon name="external" className="size-4" />
                                </a>
                            )}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

export function LessonResources({ practice, materials, openPractice }: {
    practice: Practice;
    materials: readonly StudyFile[];
    openPractice: () => void;
}) {
    const { openDrawer } = useWorkspaceOverlays();

    function openQuiz() {
        openDrawer({
            title: 'Topic quiz',
            description: 'Sample question',
            content: (
                <div className="space-y-3">
                    <p>Can equal debit and credit totals prove that every entry is correct?</p>
                    <details>
                        <summary>Check explanation</summary>
                        <p>Equal totals show that postings balance. An entry can still use the wrong account.</p>
                    </details>
                </div>
            ),
        });
    }

    return (
        <>
            <section>
                <h3 className="text-[14px] font-semibold text-ink-900">Exercises and revision</h3>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <PracticeTile
                        icon="clipboard"
                        title={practice.exercise}
                        detail="Practice with worked solutions"
                        open={openPractice}
                    />
                    <PracticeTile
                        icon="timer"
                        title={practice.quiz}
                        detail="Sample question"
                        open={openQuiz}
                    />
                </div>
            </section>
            <ExternalReading practice={practice} />
            <WeeklyResources resources={practice.resources} materials={materials} />
        </>
    );
}
