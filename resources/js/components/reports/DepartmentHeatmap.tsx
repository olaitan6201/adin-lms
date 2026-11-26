import type { ReportTableData } from '@/types/reports/analytics';

export function DepartmentHeatmap({ heatmap }: { heatmap: ReportTableData }) {
    const max = Math.max(...heatmap.rows.flatMap((row) => row.slice(1).map(Number)));
    return (
        <table
            aria-label={heatmap.title}
            className="w-full table-fixed border-separate border-spacing-x-1 border-spacing-y-2 text-center"
        >
            <thead>
                <tr>
                    {heatmap.columns.map((name, i) => (
                        <th
                            scope="col"
                            key={name}
                            className={
                                i ? 'pb-2 text-[10px] font-semibold tracking-wide text-ink-400 uppercase' : 'w-28'
                            }
                        >
                            {i ? name : <span className="sr-only">{name}</span>}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {heatmap.rows.map(([name, ...values]) => (
                    <tr key={name}>
                        <th
                            scope="row"
                            className="truncate text-left text-[11.5px] font-medium text-ink-600"
                            title={String(name)}
                        >
                            {name}
                        </th>
                        {values.map((v, i) => (
                            <td
                                key={i}
                                className="h-9 rounded-md text-[11px] font-semibold tnum"
                                style={{
                                    background: `rgba(16,185,129,${0.08 + (0.78 * Number(v)) / max})`,
                                    color: Number(v) / max > 0.55 ? '#fff' : '#22344C',
                                }}
                                title={`${name} / ${heatmap.columns[i + 1]}: ${v}%`}
                            >
                                {v}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
