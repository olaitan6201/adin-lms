import type { Manuscript, Chapter, Practice } from '@/types/learning/lesson';
import type { StudyFile } from './deviceFiles';
import { LessonResources } from './LessonResources';
import { AccountingLesson } from './AccountingLesson';
import { Card } from '@/components/ui/layout/Card';
import { StudyIcon } from '@/components/learning/Parts';
import type { ReactNode } from 'react';

export function Lesson({ manuscript, chapter, practice, materials, openPractice, actions, navigation }: {
    manuscript: Manuscript;
    chapter: Chapter;
    practice: Practice;
    materials: readonly StudyFile[];
    openPractice: () => void;
    actions: ReactNode;
    navigation: ReactNode;
}) {
    return (
        <div className="space-y-5">
            <Card
                title={manuscript.title}
                subtitle={manuscript.subtitle}
                actions={actions}
            >
                <div className="prose-none max-w-3xl space-y-5">
                    <AccountingLesson chapter={chapter} />

                    <section>
                        <h3 className="text-[14px] font-semibold text-ink-900">Embedded lecture</h3>
                        <div className="mt-2 overflow-hidden rounded-xl border border-ink-200 bg-ink-900">
                            <div className="flex aspect-video items-center justify-center">
                                <div className="text-center">
                                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white">
                                        <StudyIcon name="play" className="w-6 h-6" />
                                    </span>
                                    <p className="mt-3 text-[13px] font-medium text-white">{manuscript.recording}</p>
                                    <p className="mt-1 text-[11.5px] text-ink-400">{manuscript.duration}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <LessonResources practice={practice} materials={materials} openPractice={openPractice} />

                    <section>
                        <h3 className="text-[14px] font-semibold text-ink-900">Summary and references</h3>
                        <ul className="mt-2 space-y-1.5 text-[13.5px] leading-relaxed text-ink-600">
                            <li className="flex gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                                {manuscript.journalSummary}
                            </li>
                            <li className="flex gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                                {manuscript.trialSummary}
                            </li>
                        </ul>
                        <div className="mt-3 rounded-xl bg-ink-50 p-3.5">
                            <p className="text-[12px] font-semibold text-ink-700">Reading list</p>
                            <ul className="mt-1.5 space-y-1 text-xs text-ink-500">
                                <li>{manuscript.textbook}</li>
                                <li>{manuscript.reading}</li>
                            </ul>
                        </div>
                    </section>
                </div>
                {navigation}
            </Card>
        </div>
    );
}
