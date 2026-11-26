import type { Breakdown, ReportSeries, ReportTableData } from '@/types/reports/analytics';
export { HorizontalBars as Bars } from '@/components/overview/Charts';

export function Trend({ data, label, height = 240 }: { data: ReportSeries; label: string; height?: number }) {
    const max = Math.max(...data.series.flatMap(s => s.values));
    const x = (i: number) => 34 + 714 * i / (data.labels.length - 1);
    const y = (value: number) => 16 + (height - 42) * (1 - value / max);
    return <svg viewBox={`0 0 760 ${height}`} className="h-auto w-full" role="img" aria-label={label} fontFamily="Outfit, sans-serif" fontSize="10" fill="#7A8CA0">
        <desc>{data.series.map(s => `${s.name}: ${s.values.map((v,i) => `${data.labels[i]} ${v}`).join(', ')}`).join('. ')}</desc>
        {[0,.25,.5,.75,1].map(r => <g key={r}><line x1="34" x2="748" y1={y(r*max)} y2={y(r*max)} stroke="#E7ECF1"/>
            <text x="26" y={y(r*max)+3.5} textAnchor="end">{Math.round(r*max)}</text></g>)}
        {data.labels.map((l,i) => (i % Math.ceil(data.labels.length/8) === 0 || i === data.labels.length-1) &&
            <text key={l} x={x(i)} y={height-8} textAnchor="middle">{l}</text>)}
        {data.series.map((s,index) => {
            const path = s.values.map((v,i) => i ? `C${(x(i-1)+x(i))/2},${y(s.values[i-1])} ${(x(i-1)+x(i))/2},${y(v)} ${x(i)},${y(v)}` : `M${x(i)},${y(v)}`).join(' ');
            return <g key={s.name}><path d={`${path} L748,${y(0)} H34 Z`} fill={s.color} fillOpacity={index ? .05 : .1}/><path d={path} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                {s.values.map((v,i) => <circle key={i} cx={x(i)} cy={y(v)} r="2.6" strokeWidth="1.8" stroke={s.color} fill="white"><title>{data.labels[i]}: {v}</title></circle>)}</g>;
        })}
        {data.series.map((s,i) => <g key={s.name} transform={`translate(${34+i*150} 8)`}><rect x="0" y="-7" width="10" height="10" rx="3" fill={s.color}/><text x="16" y="2" fontSize="10.5" fill="#33475F">{s.name}</text></g>)}
    </svg>;
}

export function Mix({ items: engagementMix }: { items: Breakdown }) {
    const total = engagementMix.reduce((sum,d) => sum+d.value,0);
    return <div className="flex items-center gap-6"><div className="relative size-[150px] shrink-0"><svg viewBox="0 0 150 150" className="size-full" role="img" aria-label="Engagement breakdown">
        <circle cx="75" cy="75" r="65" fill="none" stroke="#E7ECF1" strokeWidth="20"/>
        {engagementMix.map((d,i) => <circle key={d.label} cx="75" cy="75" r="65" transform="rotate(-90 75 75)" fill="none" stroke={d.color} strokeWidth="20" pathLength={total || 1}
            strokeDasharray={`${d.value} ${total-d.value}`} strokeDashoffset={-engagementMix.slice(0,i).reduce((n,s) => n+s.value,0)}><title>{d.label}: {d.value}</title></circle>)}
    </svg><span className="absolute inset-0 flex flex-col items-center justify-center"><strong className="text-xl font-semibold text-ink-900 tnum">{(total / 1000).toFixed(1)}k</strong><small className="text-[10px] font-medium tracking-wide text-ink-400 uppercase">Actions</small></span></div>
        <ul className="min-w-0 flex-1 space-y-2">{engagementMix.map(d => <li key={d.label} className="flex items-center gap-2 text-[13px]">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: d.color }}/><span className="min-w-0 flex-1 truncate text-ink-600" title={d.label}>{d.label}</span><strong className="font-semibold tnum">{d.value}</strong></li>)}</ul>
    </div>;
}

export function Columns({ items: completionByFaculty }: { items: Breakdown }) {
    const max = Math.max(...completionByFaculty.map(d => d.value));
    const slot = 482 / completionByFaculty.length;
    return <svg viewBox="0 0 520 200" className="h-auto w-full" role="img" aria-label="Completion by faculty">
        {[12,92,172].map(y => <line key={y} x1="30" x2="512" y1={y} y2={y} stroke="#E7ECF1"/>)}
        {completionByFaculty.map((d,i) => {
            const x = 30 + slot*(i+.5);
            const h = d.value/max*160;
            return <g key={d.label}><title>{d.label}: {d.value}%</title><rect x={x-17} y={172-h} width="34" height={h} rx="5" fill={d.color}/>
                <text x={x} y="190" textAnchor="middle" fontSize="10" fill="#7A8CA0">{d.label.replace('Faculty of ','')}</text></g>;
        })}
    </svg>;
}

export function DepartmentHeatmap({ heatmap }: { heatmap: ReportTableData }) {
    const max = Math.max(...heatmap.rows.flatMap(row => row.slice(1).map(Number)));
    return <table aria-label={heatmap.title} className="w-full table-fixed border-separate border-spacing-x-1 border-spacing-y-2 text-center">
        <thead><tr>{heatmap.columns.map((name,i) => <th scope="col" key={name} className={i ? 'pb-2 text-[10px] font-semibold tracking-wide text-ink-400 uppercase' : 'w-28'}>
            {i ? name : <span className="sr-only">{name}</span>}</th>)}</tr></thead>
        <tbody>{heatmap.rows.map(([name,...values]) => <tr key={name}>
            <th scope="row" className="truncate text-left text-[11.5px] font-medium text-ink-600" title={String(name)}>{name}</th>
            {values.map((v,i) => <td key={i} className="h-9 rounded-md text-[11px] font-semibold tnum"
                style={{ background: `rgba(16,185,129,${.08+.78*Number(v)/max})`, color: Number(v)/max > .55 ? '#fff' : '#22344C' }}
                title={`${name} / ${heatmap.columns[i+1]}: ${v}%`}>{v}</td>)}
        </tr>)}</tbody>
    </table>;
}
