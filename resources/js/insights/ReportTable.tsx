export type ReportRow = [string, string, string, string];

type Props = {
    columns: ReportRow;
    rows: ReportRow[];
};

export function ReportTable({ columns, rows }: Props) {
    if (rows.length === 0) {
        return <p>No records match this selection.</p>;
    }

    return (
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Academic activity details">
            <table className="w-full text-left text-sm">
                <caption className="pb-3 text-left text-xl font-semibold">Academic activity details</caption>
                <thead className="border-y border-slate-300 bg-slate-50">
                    <tr>
                        {columns.map((column) => (
                            <th scope="col" className="p-3" key={column}>
                                {column}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index} className="border-b border-slate-200">
                            {row.map((cell, i) => (
                                <td key={columns[i]} className="p-3 align-top break-words">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
