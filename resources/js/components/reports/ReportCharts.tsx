import { enrolmentTrend, engagementMix, completionByFaculty } from './analyticsFixtures';

export function Trend({ data, label }: { data: typeof enrolmentTrend; label: string }) {
    const max = Math.max(...data.series.flatMap(s => s.values));
    const x = (i: number) => 40 + 680*i/(data.labels.length-1);
    const y = (value: number) => 198 - 169*value/max;
    return <figure><div className="flex flex-wrap gap-x-5 text-xs">{data.series.map(s => <span key={s.name}><i className="mr-1 inline-block size-2.5 rounded-sm" style={{ background: s.color }}/>{s.name}</span>)}</div>
        <svg viewBox="0 0 754 224" className="w-full" role="img" aria-label={label}>
            <desc>{data.series.map(s => `${s.name}: ${s.values.map((v,i) => `${data.labels[i]} ${v}`).join(', ')}`).join('. ')}</desc>
            {[0,.25,.5,.75,1].map(r => <g key={r}><line x1={40} x2={720} y1={y(r*max)} y2={y(r*max)} stroke="#e7ecf1"/>
                <text x={31} y={y(r*max)+3} textAnchor="end" fill="#526477" fontSize={11}>{Math.round(r*max)}</text></g>)}
            {data.labels.map((l,i) => <text key={l} x={x(i)} y={218} textAnchor="middle" fontSize={11} fill="#526477">{l}</text>)}
            {data.series.map(s => {
                const path = s.values.map((v,i) => i ? `C${(x(i-1)+x(i))/2},${y(s.values[i-1])} ${(x(i-1)+x(i))/2},${y(v)} ${x(i)},${y(v)}` : `M${x(i)},${y(v)}`).join(' ');
                return <g key={s.name}><path d={`${path} L720,198 H40 Z`} fill={s.color} opacity=".10"/><path d={path} fill="none" stroke={s.color} strokeWidth={2.2}/>
                    {s.values.map((v,i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" stroke={s.color} fill="white"><title>{data.labels[i]}: {v}</title></circle>)}</g>;
            })}
        </svg>
    </figure>;
}

export function Mix() {
    const total = engagementMix.reduce((sum,d) => sum+d.value,0);
    return <div className="flex flex-wrap items-center justify-center gap-5">
        <div className="relative size-[150px] shrink-0"><svg viewBox="0 0 100 100" className="-rotate-90" aria-hidden="true">
            {engagementMix.map((d,i) => <circle key={d.label} cx={50} cy={50} r={42} fill="none" stroke={d.color} strokeWidth={13} pathLength={total}
                strokeDasharray={`${d.value} ${total-d.value}`} strokeDashoffset={-engagementMix.slice(0,i).reduce((n,s) => n+s.value,0)}/>)}
        </svg><span className="absolute inset-0 grid place-content-center text-center"><strong className="text-2xl">6.9k</strong><small>Actions</small></span></div>
        <ul className="min-w-0 flex-1 space-y-2 text-xs">{engagementMix.map(d => <li key={d.label} className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full" style={{ background: d.color }}/><span className="flex-1">{d.label}</span><strong>{d.value.toLocaleString('en')}</strong></li>)}</ul>
    </div>;
}

export function Bars({ items }: { items: typeof completionByFaculty }) {
    return <ul className="space-y-3">{items.map(d => <li key={d.label}>
        <div className="flex items-center justify-between gap-2 text-xs"><span>{d.label}</span><strong>{d.value}%</strong></div>
        <div className="mt-1 h-2 rounded-full bg-ink-100"><div className="h-full rounded-full" style={{ width: `${d.value}%`, background: d.color }}/></div>
    </li>)}</ul>;
}

export function Columns() {
    return <div className="flex h-52 items-end gap-4 px-3">{completionByFaculty.map(d => <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
        <strong className="text-xs">{d.value}%</strong><div className="w-3/5 max-w-32 rounded-t" style={{ background: d.color, height: `${d.value}%` }}/>
        <span className="min-h-10 border-t pt-1 text-center text-xs">{d.label.replace('Faculty of ','')}</span></div>)}</div>;
}
