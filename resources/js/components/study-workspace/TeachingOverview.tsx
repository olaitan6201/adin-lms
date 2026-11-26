import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import { Card } from '@/components/workspace/Elements';
import { Meter, StudyIcon } from '@/components/study-workspace/Parts';

export function TeachingOverview() {
    const { notify } = useWorkspaceOverlays();
    const tiles = [
        { label: 'Enrolled students', value: '68' },
        { label: 'Published modules', value: '5 of 7' },
        { label: 'Resources', value: '7' },
        { label: 'Assignments', value: '2' },
    ];

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
                            <Meter value={46} label="Material completed by students" showValue={true} />
                            <Meter value={75} label="Assignment submission rate" showValue={true} />
                            <Meter value={92} label="Attendance" showValue={true} tone="sky" />
                        </div>
                    </>
                </Card>
                <Card title="What needs attention">
                    <ul className="divide-y divide-ink-100">
                        {[
                            {
                                icon: 'alert',
                                tone: 'text-amber-600',
                                title: 'Week 6 and Week 7 modules are still in draft',
                                meta: '14 students have reached Week 6',
                            },
                            {
                                icon: 'clipboard',
                                tone: 'text-amber-600',
                                title: '34 submissions are waiting for a score',
                                meta: 'Oldest received 12 Nov 2026',
                            },
                            {
                                icon: 'users',
                                tone: 'text-rose-600',
                                title: '5 students are below 60% attendance',
                                meta: 'Head of department has been notified',
                            },
                        ].map((item) => (
                            <li key={item.title} className="flex items-start gap-3 py-3">
                                <span className={`mt-0.5 ${item.tone}`}>
                                    <StudyIcon name={item.icon} className="w-4 h-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[13.5px] font-medium text-ink-800">{item.title}</span>
                                    <span className="mt-0.5 block text-xs text-ink-500">{item.meta}</span>
                                </span>
                                <button type="button" className="btn btn-outline btn-sm" onClick={() => notify('Opened')}>
                                    Open
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
            <div className="xl:col-span-4 space-y-5">
                <Card title="Offering settings">
                    <div className="space-y-3">
                        <label className="block">
                            <span className="label">Delivery mode</span>
                            <select className="select">
                                <option>Blended</option>
                                <option>Fully online</option>
                                <option>Face-to-face</option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="label">Content release</span>
                            <select className="select">
                                <option>By week</option>
                                <option>All published content</option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="label">Assignment visibility</span>
                            <select className="select">
                                <option>To enrolled students</option>
                                <option>Hidden</option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="label">Discussion</span>
                            <select className="select">
                                <option>Open, moderated</option>
                                <option>Open, unmoderated</option>
                                <option>Closed</option>
                            </select>
                        </label>
                    </div>
                </Card>
                <Card title="Classmates" subtitle="68 registered students">
                    <>
                        <ul className="divide-y divide-ink-100">
                            {['Blessing Okonkwo', 'Chinedu Okafor', 'Aisha Bello', 'Emeka Uzoma', 'Oluwaseun Ajayi'].map((name, index) => (
                                <li key={name} className="flex items-center gap-3 py-2.5">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-100 text-[10px] font-semibold text-ink-600">
                                        {name
                                            .split(' ')
                                            .map((part) => part[0])
                                            .join('')}
                                    </span>
                                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink-700">{name}</span>
                                    <span className={`text-[12px] tnum ${index === 3 ? 'text-rose-700' : 'text-ink-500'}`}>
                                        {[92, 78, 96, 64, 88][index]}%
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <button type="button" className="btn btn-outline btn-sm mt-3 w-full" onClick={() => notify('Full roster opened')}>
                            Open full roster
                        </button>
                    </>
                </Card>
            </div>
        </div>
    );
}
