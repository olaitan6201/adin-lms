import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AttendanceSummary } from './AttendanceSummary';

type Props = {
    title: string;
    columns: string[];
    rows: (string | number)[][];
    usage: boolean;
};

export function ReportTable({ title, columns, rows, usage }: Props) {
    const rateColumn = columns.findIndex((label) => label === 'Completion rate' || label === 'Engagement rate');
    return (
        <>
            <AttendanceSummary columns={columns} rows={rows} />
            <div
                role="region"
                aria-label="Report data"
                aria-describedby={usage ? undefined : 'scroll-hint'}
                tabIndex={0}
                className={`${usage ? 'hidden sm:block' : ''} max-h-[36rem] overflow-auto rounded-xl border border-ink-100`}
            >
                <div className="min-w-xl [&>[data-slot=table-container]]:overflow-visible">
                    <Table className="tbl">
                        <TableCaption className="sr-only">{title}</TableCaption>
                        <TableHeader className="sticky top-0 z-10 bg-ink-50 [&_th]:text-ink-600">
                            <TableRow>
                                {columns.map((column) => (
                                    <TableHead scope="col" key={column} className="whitespace-normal">
                                        {column}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row, i) => (
                                <TableRow key={i}>
                                    {row.map((cell, j) =>
                                        j === 0 ? (
                                            <TableHead
                                                key={j}
                                                scope="row"
                                                className="sticky left-0 max-w-32 bg-background whitespace-normal wrap-anywhere"
                                            >
                                                {cell}
                                            </TableHead>
                                        ) : (
                                            <TableCell key={j} className="whitespace-normal wrap-anywhere tabular-nums">
                                                {j === rateColumn &&
                                                typeof cell === 'string' &&
                                                /^\d+(\.\d+)?%$/.test(cell) ? (
                                                    <span className="flex items-center gap-2">
                                                        <span
                                                            aria-hidden="true"
                                                            className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-ink-100"
                                                        >
                                                            <span
                                                                className="block h-full rounded-full bg-brand-600"
                                                                style={{ width: cell }}
                                                            />
                                                        </span>
                                                        {cell}
                                                    </span>
                                                ) : (
                                                    cell
                                                )}
                                            </TableCell>
                                        ),
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}
