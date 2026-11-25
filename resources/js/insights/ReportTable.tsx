import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Props = {
    title: string;
    columns: string[];
    rows: (string | number)[][];
    usage: boolean;
};

export function ReportTable({ title, columns, rows, usage }: Props) {
    return (
        <Table regionLabel="Report data" regionDescriptionId={usage ? undefined : 'scroll-hint'}
            containerClassName={usage ? 'hidden sm:block' : 'max-h-[36rem] overflow-auto'} className="min-w-[36rem]">
            <TableCaption className="sr-only">{title}</TableCaption>
            <TableHeader className="sticky top-0 bg-muted">
                <TableRow>{columns.map((column) => (
                    <TableHead scope="col" key={column} className={usage ? 'whitespace-nowrap' : undefined}>
                        {column}
                    </TableHead>
                ))}</TableRow>
            </TableHeader>
            <TableBody>{rows.map((row, i) => (
                <TableRow key={i}>{row.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}</TableRow>
            ))}</TableBody>
        </Table>
    );
}
