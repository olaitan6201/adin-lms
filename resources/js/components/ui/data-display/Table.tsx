import type { ReactNode } from 'react';

type TableProps = {
    columns: string[];
    rows: ReactNode[][];
    empty?: ReactNode;
    caption?: string;
    rowKeys?: readonly (string | number)[];
};

export function Table({ columns, rows, empty = 'No records to display.', caption, rowKeys }: TableProps) {
    return (
        <div className="overflow-x-auto" data-scroll>
            <table className="tbl">
                {caption && <caption className="sr-only">{caption}</caption>}
                <thead><tr>{columns.map((label, index) => <th key={index} scope="col">{label}</th>)}</tr></thead>
                <tbody>
                    {rows.length ? rows.map((cells, index) => (
                        <tr key={rowKeys?.[index] ?? index}>
                            {cells.map((cell, column) => <td key={column}>{cell}</td>)}
                        </tr>
                    )) : (
                        <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-ink-500">{empty}</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
