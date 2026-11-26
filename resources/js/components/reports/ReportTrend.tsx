import type { ReportSeries } from '@/types/reports/analytics';

type TrendProps = {
    data: ReportSeries;
    label: string;
    height?: number;
};

export function Trend({ data, label, height = 240 }: TrendProps) {
    const max = Math.max(...data.series.flatMap((s) => s.values));
    const x = (i: number) => 34 + (714 * i) / (data.labels.length - 1);
    const y = (value: number) => 16 + (height - 42) * (1 - value / max);
    return (
        <svg
            viewBox={`0 0 760 ${height}`}
            className="h-auto w-full"
            role="img"
            aria-label={label}
            fontSize="10"
            fill="#7A8CA0"
        >
            <desc>
                {data.series
                    .map((s) => `${s.name}: ${s.values.map((v, i) => `${data.labels[i]} ${v}`).join(', ')}`)
                    .join('. ')}
            </desc>
            {[0, 0.25, 0.5, 0.75, 1].map((r) => (
                <g key={r}>
                    <line x1="34" x2="748" y1={y(r * max)} y2={y(r * max)} stroke="#E7ECF1" />
                    <text x="26" y={y(r * max) + 3.5} textAnchor="end">
                        {Math.round(r * max)}
                    </text>
                </g>
            ))}
            {data.labels.map(
                (l, i) =>
                    (i % Math.ceil(data.labels.length / 8) === 0 || i === data.labels.length - 1) && (
                        <text key={l} x={x(i)} y={height - 8} textAnchor="middle">
                            {l}
                        </text>
                    ),
            )}
            {data.series.map((s, index) => {
                const path = s.values
                    .map((v, i) =>
                        i
                            ? `C${(x(i - 1) + x(i)) / 2},${y(s.values[i - 1])} ${(x(i - 1) + x(i)) / 2},${y(v)} ${x(i)},${y(v)}`
                            : `M${x(i)},${y(v)}`,
                    )
                    .join(' ');
                return (
                    <g key={s.name}>
                        <path d={`${path} L748,${y(0)} H34 Z`} fill={s.color} fillOpacity={index ? 0.05 : 0.1} />
                        <path
                            d={path}
                            fill="none"
                            stroke={s.color}
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        {s.values.map((v, i) => (
                            <circle key={i} cx={x(i)} cy={y(v)} r="2.6" strokeWidth="1.8" stroke={s.color} fill="white">
                                <title>
                                    {data.labels[i]}: {v}
                                </title>
                            </circle>
                        ))}
                    </g>
                );
            })}
            {data.series.map((s, i) => (
                <g key={s.name} transform={`translate(${34 + i * 150} 8)`}>
                    <rect x="0" y="-7" width="10" height="10" rx="3" fill={s.color} />
                    <text x="16" y="2" fontSize="10.5" fill="#33475F">
                        {s.name}
                    </text>
                </g>
            ))}
        </svg>
    );
}
