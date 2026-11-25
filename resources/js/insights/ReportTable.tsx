import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Props = {
    title: string;
    columns: string[];
    rows: (string | number)[][];
    usage: boolean;
};

export function ReportTable({ title, columns, rows, usage }: Props) {
    return (
        <div role="region" aria-label="Report data" aria-describedby={usage ? undefined : 'scroll-hint'}
            tabIndex={0} className={`${usage ? 'hidden sm:block' : ''} max-h-[36rem] overflow-auto`}>
            <div className="min-w-xl [&>[data-slot=table-container]]:overflow-visible"><Table>
                <TableCaption className="sr-only">{title}</TableCaption>
                <TableHeader className="sticky top-0 z-10 bg-muted">
                    <TableRow>{columns.map((column) => (
                        <TableHead scope="col" key={column} className="whitespace-normal">
                            {column}
                        </TableHead>
                    ))}</TableRow>
                </TableHeader>
                <TableBody>{rows.map((row, i) => (
                    <TableRow key={i}>{row.map((cell, j) => j === 0
                        ? <TableHead key={j} scope="row" className="sticky left-0 max-w-32 bg-background whitespace-normal wrap-anywhere">{cell}</TableHead>
                        : <TableCell key={j} className="whitespace-normal wrap-anywhere">{cell}</TableCell>)}</TableRow>
                ))}</TableBody>
            </Table></div>
        </div>
    );
}
