type Series = { color: string; values: readonly number[] };
type Point = [number, number];

function smoothPath(points: Point[]) {
    return points.map(([x, y], index) => {
        if (!index) return `M ${x} ${y}`;
        const [previousX, previousY] = points[index - 1];
        const mid = (previousX + x) / 2;
        return `C ${mid} ${previousY}, ${mid} ${y}, ${x} ${y}`;
    }).join(' ');
}

export function Sparkline({ color, values }: Series) {
    const max = Math.max(...values, 1);
    const points = values.map<Point>((value, index) => [index * 120 / (values.length - 1), 32 - value / max * 28]);
    const line = smoothPath(points);
    return <svg viewBox="0 0 120 34" className="h-8 w-full" role="img" aria-label="Trend">
        <path d={`${line} L 120 34 L 0 34 Z`} fill={color} fillOpacity=".12"/>
        <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>;
}

export function AreaChart({ labels, height, label, values, color }: Series & { labels: readonly string[]; height: number; label: string }) {
    const max = Math.max(...values, 1);
    const y = (ratio: number) => 16 + (height - 42) * (1 - ratio);
    const points = values.map<Point>((v, i) => [34 + 714 * i / (labels.length - 1), y(v / max)]);
    const line = smoothPath(points);
    return <svg viewBox={`0 0 760 ${height}`} className="h-auto w-full" role="img" aria-label={label} fontFamily="Outfit, sans-serif" fontSize="10" fill="#7A8CA0">
        {[0, .25, .5, .75, 1].map(ratio => <g key={ratio}>
            <line x1="34" x2="748" y1={y(ratio)} y2={y(ratio)} stroke="#E7ECF1"/>
            <text x="26" y={y(ratio) + 3.5} textAnchor="end">{Math.round(max * ratio)}</text>
        </g>)}
        {labels.map((text, i) => (i % Math.ceil(labels.length / 8) === 0 || i === labels.length - 1) &&
            <text key={text} x={points[i][0]} y={height - 8} textAnchor="middle">{text}</text>)}
        <path d={`${line} L 748 ${y(0)} L 34 ${y(0)} Z`} fill={color} fillOpacity=".1"/>
        <path d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        {points.map(([x, cy], i) => <circle key={x} cx={x} cy={cy} r="2.6" fill="white" stroke={color} strokeWidth="1.8"><title>{labels[i]}: {values[i]}</title></circle>)}
    </svg>;
}

export function DeliveryColumns({ labels, values }: { labels: readonly string[]; values: readonly number[] }) {
    const slot = 482 / labels.length;
    const width = Math.min(slot * .55, 34);
    const max = Math.max(...values);
    return <svg viewBox="0 0 520 210" className="h-auto w-full" role="img" aria-label="Active course offerings by month">
        {[12, 97, 182].map(y => <line key={y} x1="30" x2="512" y1={y} y2={y} stroke="#E7ECF1"/>)}
        {values.map((v, i) => {
            const x = 30 + slot * (i + .5);
            const h = v / max * 170;
            return <g key={labels[i]}><title>{labels[i]}: {v}</title>
                <rect x={x - width / 2} y={182 - h} width={width} height={h} rx="5" fill={i >= 6 ? '#10B981' : '#AEBCCB'}/>
                <text x={x} y="200" textAnchor="middle" fontSize="10" fill="#7A8CA0">{labels[i]}</text>
            </g>;
        })}
    </svg>;
}

export function HorizontalBars({ items }: { items: readonly { label: string; value: number; color: string }[] }) {
    const max = Math.max(...items.map(i => i.value), 1);
    return <div>{items.map(i => <div key={i.label} className="grid grid-cols-[minmax(0,1fr)_56px] items-center gap-3 py-1.5">
        <div className="min-w-0"><p className="mb-1 truncate text-[13px] font-medium text-ink-700">{i.label}</p>
            <div className="h-2 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full" style={{ width: `${100 * i.value / max}%`, background: i.color }}/></div>
        </div><span className="text-right text-[13px] font-semibold text-ink-800 tnum">{i.value}</span>
    </div>)}</div>;
}
