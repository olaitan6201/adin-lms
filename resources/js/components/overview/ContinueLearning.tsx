import type { Lesson } from './panelTypes';
import { SampleDownload } from '@/components/learning/SampleDownload';
import type { StudyFile } from '@/components/learning/deviceFiles';
import { ProgressRing } from '@/components/icons/ProgressRing';
import { Card } from '@/components/ui/layout/Card';
import { Go } from './OverviewParts';

function CompletionRing({ progress, code }: Pick<Lesson, 'progress' | 'code'>) {
    return (
        <div
            className="relative inline-flex size-24 shrink-0"
            role="img"
            aria-label={`${code} lesson progress: ${progress} percent`}
        >
            <ProgressRing percent={progress} />
            <span className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-semibold text-ink-900 tnum">{progress}%</span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-ink-400">{code}</span>
            </span>
        </div>
    );
}

type ContinueLearningProps = {
    lesson: Lesson;
    material: StudyFile;
};

export function ContinueLearning({ lesson, material }: ContinueLearningProps) {
    return (
        <Card title="Continue learning" subtitle="The lesson you were last working on">
            <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-5">
                    <CompletionRing code={lesson.code} progress={lesson.progress} />
                    <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-semibold text-ink-900">{lesson.title}</p>
                        <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{lesson.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Go to="student/course" primary>
                                Resume lesson
                            </Go>
                            <SampleDownload file={material} label="Save offline" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 border-t border-ink-100 pt-4 sm:grid-cols-3">
                    {lesson.summary.map(({ label, value, hint }) => (
                        <div key={label} className="rounded-xl bg-ink-50/70 p-3.5">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</p>
                            <p className="mt-1 text-[15px] font-semibold text-ink-900">{value}</p>
                            <p className="mt-0.5 text-[11.5px] text-ink-500">{hint}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
