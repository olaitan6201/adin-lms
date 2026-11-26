import { Disclosure } from '@/components/ui/controls/Disclosure';
import { ReportTable } from '@/components/reports/ReportTable';
import { Button } from '@/components/ui/button';
import { UsageMeasures } from '@/components/reports/UsageMeasures';
import { names, descriptions, type Family, type ReportProps } from './reportFamilies';

export function ReportResults({
    family,
    reportScope,
    limitMessage,
    columns,
    table,
    path,
}: Pick<ReportProps, 'family' | 'reportScope' | 'limitMessage' | 'columns' | 'table'> & {
    path: (base: string, family: Family) => string;
}) {
    return (
        <section aria-labelledby="report-title" className="card min-w-0 space-y-4 p-5">
            {reportScope && <p>{descriptions[family]}</p>}
            {!limitMessage && reportScope && (
                <>
                    {Object.keys(table.totals).length > 0 && (
                        <Disclosure label="Activity totals">
                            <dl className="grid gap-2 py-3 sm:grid-cols-3">
                                {Object.entries(table.totals).map(([key, value]) => (
                                    <div key={key}>
                                        <dt>{key}</dt>
                                        <dd className="font-semibold">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </Disclosure>
                    )}
                    {family === 'institution-usage' && <UsageMeasures rows={table.rows} />}
                    {family !== 'institution-usage' && table.rows.length > 0 && (
                        <p id="scroll-hint" className="text-sm text-muted-foreground sm:hidden">
                            Scroll the table sideways to see every column.
                        </p>
                    )}
                    {table.rows.length > 0 && (
                        <ReportTable title={names[family]} columns={columns} rows={table.rows} usage={family === 'institution-usage'} />
                    )}
                </>
            )}
            {!limitMessage && (
                <nav aria-label="Download report" className="flex flex-wrap gap-4">
                    <Button asChild variant="outline">
                        <a href={path('/reports/export/pdf', family)}>Download PDF</a>
                    </Button>
                    <Button asChild variant="outline">
                        <a href={path('/reports/export/xlsx', family)}>Download Excel</a>
                    </Button>
                </nav>
            )}
        </section>
    );
}
