import type { Breakdown } from '@/types/reports/analytics';
import { SegmentedRing } from '@/components/icons/SegmentedRing';
export { DepartmentHeatmap } from './DepartmentHeatmap';

export { Trend } from './ReportTrend';

export { HorizontalBars as Bars } from '@/components/overview/Charts';

export function Mix({ items: engagementMix }: { items: Breakdown }) {
    const total = engagementMix.reduce((sum, d) => sum + d.value, 0);
    return (
        <div className="flex items-center gap-6">
            <div className="relative size-[150px] shrink-0">
                <SegmentedRing
                    size={150}
                    strokeWidth={20}
                    segments={engagementMix}
                    label="Learning actions by engagement type"
                />
                <span className="absolute inset-0 flex flex-col items-center justify-center">
                    <strong className="text-xl font-semibold text-ink-900 tnum">{(total / 1000).toFixed(1)}k</strong>
                    <small className="text-[10px] font-medium tracking-wide text-ink-400 uppercase">Actions</small>
                </span>
            </div>
            <ul className="min-w-0 flex-1 space-y-2">
                {engagementMix.map((d) => (
                    <li key={d.label} className="flex items-center gap-2 text-[13px]">
                        <span className="size-2.5 shrink-0 rounded-sm" style={{ background: d.color }} />
                        <span className="min-w-0 flex-1 truncate text-ink-600" title={d.label}>
                            {d.label}
                        </span>
                        <strong className="font-semibold tnum">{d.value}</strong>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function Columns({ items: completionByFaculty }: { items: Breakdown }) {
    const max = Math.max(...completionByFaculty.map((d) => d.value));
    const slot = 482 / completionByFaculty.length;
    return (
        <svg
            viewBox="0 0 520 200"
            className="h-auto w-full"
            role="img"
            aria-label="Completion by faculty"
        >
            {[12, 92, 172].map((y) => (
                <line
                    key={y}
                    x1="30"
                    x2="512"
                    y1={y}
                    y2={y}
                    stroke="#E7ECF1"
                />
            ))}
            {completionByFaculty.map((d, i) => {
                const x = 30 + slot * (i + 0.5);
                const h = (d.value / max) * 160;
                return (
                    <g key={d.label}>
                        <title>
                            {d.label}: {d.value}%
                        </title>
                        <rect
                            x={x - 17}
                            y={172 - h}
                            width="34"
                            height={h}
                            rx="5"
                            fill={d.color}
                        />
                        <text
                            x={x}
                            y="190"
                            textAnchor="middle"
                            fontSize="10"
                            fill="#7A8CA0"
                        >
                            {d.label.replace('Faculty of ', '')}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}
