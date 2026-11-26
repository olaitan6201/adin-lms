import type { Health } from '@/types/learning/study';
import { Card } from '@/components/ui/layout/Card';
import { Meter, StudyIcon } from '@/components/learning/Parts';

export function TeachingOverview({ health, select, settings, change }: {
    health: Health;
    select: (tab: string) => void;
    settings: Record<string, string>;
    change: (key: string, value: string) => void;
}) {
    const tiles = health.tiles;

    return (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <div className="xl:col-span-8 space-y-5">
                <Card title="Course health" subtitle="Progress of the students registered in this offering">
                    <>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {tiles.map((tile) => (
                                <div key={tile.label} className="rounded-xl border border-ink-100 bg-ink-50/60 p-3.5">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{tile.label}</p>
                                    <p className="mt-1 text-lg font-semibold text-ink-900 tnum">{tile.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-5 space-y-4">
                            <Meter value={health.completion} label="Material completed by students" showValue={true} />
                            <Meter value={health.submissions} label="Assignment submission rate" showValue={true} />
                            <Meter
                                value={health.attendanceRate}
                                label="Attendance"
                                showValue={true}
                                tone="sky"
                            />
                        </div>
                    </>
                </Card>
                <Card title="What needs attention">
                    <ul className="divide-y divide-ink-100">
                        {health.attention.map((item) => (
                            <li key={item.title} className="flex items-start gap-3 py-3">
                                <span className={`mt-0.5 ${item.tone}`}>
                                    <StudyIcon name={item.icon} className="w-4 h-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[13.5px] font-medium text-ink-800">{item.title}</span>
                                    <span className="mt-0.5 block text-xs text-ink-500">{item.meta}</span>
                                </span>
                                <button type="button" className="btn btn-outline btn-sm" onClick={() => select(item.tab)}>
                                    Open
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
            <div className="xl:col-span-4 space-y-5">
                <Card title="Offering settings" subtitle="Draft selections for this visit; no published policy changes">
                    <div className="space-y-3">
                        <label className="block">
                            <span className="label">Delivery mode</span>
                            <select
                                className="select"
                                value={settings.mode ?? 'Blended'}
                                onChange={(event) => change('mode', event.target.value)}
                            >
                                <option>Blended</option>
                                <option>Fully online</option>
                                <option>Face-to-face</option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="label">Content release</span>
                            <select
                                className="select"
                                value={settings.release ?? 'By week'}
                                onChange={(event) => change('release', event.target.value)}
                            >
                                <option>By week</option>
                                <option>All published content</option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="label">Assignment visibility</span>
                            <select
                                className="select"
                                value={settings.visibility ?? 'To enrolled students'}
                                onChange={(event) => change('visibility', event.target.value)}
                            >
                                <option>To enrolled students</option>
                                <option>Hidden</option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="label">Discussion</span>
                            <select
                                className="select"
                                value={settings.discussion ?? 'Open, moderated'}
                                onChange={(event) => change('discussion', event.target.value)}
                            >
                                <option>Open, moderated</option>
                                <option>Open, unmoderated</option>
                                <option>Closed</option>
                            </select>
                        </label>
                    </div>
                </Card>
                <Card title="Classmates" subtitle={health.rosterLabel}>
                    <>
                        <ul className="divide-y divide-ink-100">
                            {health.classmates.map(({ name, attendance, needsAttention }) => (
                                <li key={name} className="flex items-center gap-3 py-2.5">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-100 text-[10px] font-semibold text-ink-600">
                                        {name
                                            .split(' ')
                                            .map((part) => part[0])
                                            .join('')}
                                    </span>
                                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink-700">{name}</span>
                                    <span className={`text-[12px] tnum ${needsAttention ? 'text-rose-700' : 'text-ink-500'}`}>
                                        {attendance}%
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-3 text-xs">Showing the {health.classmates.length} sample roster entries.</p>
                    </>
                </Card>
            </div>
        </div>
    );
}
