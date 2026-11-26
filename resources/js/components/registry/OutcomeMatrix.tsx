
export function OutcomeMatrix({ columns, matrix }: { columns:string[]; matrix:{outcome:string;weights:number[]}[] }) {
    return <><div role="table" aria-label="Course outcome to programme outcome weights" className="space-y-2">
        <div role="row" className="flex items-center gap-2"><div role="columnheader" aria-label="Course outcome" className="w-28 shrink-0"/>
            <div role="presentation" className="grid flex-1 grid-cols-5 gap-1">{columns.map(c => <div role="columnheader" key={c} className="px-1 pb-2 text-center text-[10px] font-semibold tracking-wide text-ink-400">{c}</div>)}</div></div>
        {matrix.map(({outcome, weights}) => <div role="row" key={outcome} className="flex items-center gap-2">
            <div role="rowheader" title={outcome} className="w-28 shrink-0 truncate text-[11.5px] font-medium text-ink-600">{outcome}</div>
            <div role="presentation" className="grid flex-1 grid-cols-5 gap-1">{weights.map((value,i) => <span role="cell" key={columns[i]}
                title={`${outcome} / ${columns[i]}: ${value}`} className="grid h-9 place-items-center rounded-md text-[11px] font-semibold"
                style={{background:`rgba(16,185,129,${0.08+value*0.26})`,color:value>1?'white':'#22344C'}}>{value}</span>)}</div>
        </div>)}</div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-ink-500">{['Mastered (3)','Reinforced (2)','Introduced (1)','Not covered (0)'].map((label,i) => <span key={label} className="inline-flex items-center gap-1.5"><i aria-hidden className="size-3 rounded" style={{background:['#34bf95','#9be2ca','#d9f4e9','#f1f5f9'][i]}}/>{label}</span>)}</div></>;
}
