import type { StudyModules } from '@/types/learning/study';
import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import { StudyIcon } from '@/components/learning/Parts';

const stateIcon: Record<string, string> = {
    complete: 'check',
    'in progress': 'play',
    available: 'document',
    locked: 'lock',
};
export function LessonMenu({ studentModules, summary }: { summary: string; studentModules: StudyModules }) {
    const { notify } = useWorkspaceOverlays();
    const items = studentModules.map((module) => (
        <li key={module.title}>
            <button
                type="button"
                className={`flex w-full items-start gap-3 border-l-2 px-4 py-3 text-left transition-colors ${module.state === 'in progress' ? 'border-brand-500 bg-ink-50' : 'border-transparent hover:bg-ink-50/70'}`}
                onClick={() => notify(`${module.title} opened`)}
            >
                <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                        module.state === 'complete'
                            ? 'bg-brand-100 text-brand-700'
                            : module.state === 'in progress'
                              ? 'bg-brand-600 text-white'
                              : module.state === 'locked'
                                ? 'bg-ink-100 text-ink-400'
                                : 'bg-white text-ink-500 ring-1 ring-ink-200'
                    }`}
                >
                    <StudyIcon name={stateIcon[module.state]} className="w-3.5 h-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-400">{module.week}</span>
                    <span className="mt-0.5 block text-[13px] font-medium leading-snug text-ink-800">{module.title}</span>
                    <span className="mt-1 flex items-center gap-2 text-[11.5px] text-ink-500">
                        <StudyIcon name="clock" className="w-3.5 h-3.5" />
                        {module.duration}
                        <span className="text-ink-300">|</span>
                        {module.type}
                    </span>
                </span>
            </button>
        </li>
    ));

    return (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
            <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3">
                <p className="text-[13px] font-semibold text-ink-900">Course content</p>
                <span className="text-[11.5px] text-ink-500">{summary}</span>
            </div>
            <ul className="divide-y divide-ink-50">{items}</ul>
        </div>
    );
}
