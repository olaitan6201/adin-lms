import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import { LessonResources } from './LessonResources';
import { AccountingLesson } from './AccountingLesson';
import { Card, Action } from '@/components/workspace/Elements';
import { StudyIcon } from '@/components/learning/Parts';

export function Lesson() {
    const { notify } = useWorkspaceOverlays();
    return (
        <div className="space-y-5">
            <Card
                title="Week 3 · Journals and ledgers"
                subtitle="Chapter manuscript · 31 minutes · updated 12 Nov 2026"
                actions={
                    <>
                        <Action icon="download" variant="outline" size="sm">
                            Save offline
                        </Action>
                        <Action icon="check" variant="primary" size="sm">
                            Mark complete
                        </Action>
                    </>
                }
            >
                <>
                    <div className="prose-none max-w-3xl space-y-5">
                        <AccountingLesson />

                        <section>
                            <h3 className="text-[14px] font-semibold text-ink-900">Embedded lecture</h3>
                            <div className="mt-2 overflow-hidden rounded-xl border border-ink-200 bg-ink-900">
                                <div className="flex aspect-video items-center justify-center">
                                    <div className="text-center">
                                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white">
                                            <StudyIcon name="play" className="w-6 h-6" />
                                        </span>
                                        <p className="mt-3 text-[13px] font-medium text-white">Lecture recording: journals and ledgers</p>
                                        <p className="mt-1 text-[11.5px] text-ink-400">31:12 · caption track available</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <LessonResources />

                        <section>
                            <h3 className="text-[14px] font-semibold text-ink-900">Summary and references</h3>
                            <ul className="mt-2 space-y-1.5 text-[13.5px] leading-relaxed text-ink-600">
                                <li className="flex gap-2">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />A journal records the transaction
                                    as it happens; the ledger accumulates balances by account.
                                </li>
                                <li className="flex gap-2">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />A trial balance lists debit and
                                    credit balances and shows that the arithmetic of posting agrees.
                                </li>
                            </ul>
                            <div className="mt-3 rounded-xl bg-ink-50 p-3.5">
                                <p className="text-[12px] font-semibold text-ink-700">Reading list</p>
                                <ul className="mt-1.5 space-y-1 text-xs text-ink-500">
                                    <li>Financial Accounting: An Introduction to Concepts, Methods and Uses</li>
                                    <li>IFRS Foundation, IAS 2 Inventories (summary note)</li>
                                </ul>
                            </div>
                        </section>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-5">
                        <button type="button" className="btn btn-outline" onClick={() => notify('Previous lesson')}>
                            Previous lesson
                        </button>
                        <button type="button" className="btn btn-primary" onClick={() => notify('Next lesson opened')}>
                            Next lesson · Week 4
                        </button>
                    </div>
                </>
            </Card>
        </div>
    );
}
