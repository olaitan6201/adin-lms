import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from '@inertiajs/react';
import type { Infrastructure } from './InfrastructurePanel';

export function InfrastructureReadings({ data }: { data: Infrastructure }) {
    const readings = [
        ['Registered file bytes', data.bytes.toLocaleString(), data.bytes >= data.settings.storage_mib * 1048576],
        ['Database round trip', `${data.probe} ms`, data.probe >= data.settings.probe_ms],
        ['Database queue rows (including reserved)', data.jobs ?? `Not measured (${data.queue} driver)`, null],
        ['Retained failed jobs', data.failed ?? 'Failure store not measured', null],
    ] as const;

    return (
        <section aria-labelledby="readings-heading" className="grid gap-3">
            <h2 id="readings-heading" className="text-xl font-semibold">Storage and performance</h2>
            <div className="flex flex-wrap items-center gap-2">
                <p>Sampled <time dateTime={data.measured}>{new Date(data.measured).toLocaleString()}</time>.</p>
                <Button asChild variant="outline"><Link href="/operations">Refresh readings</Link></Button>
            </div>
            <Table aria-labelledby="readings-heading">
                <TableHeader><TableRow><TableHead>Measure</TableHead><TableHead>Reading</TableHead></TableRow></TableHeader>
                <TableBody>
                    {readings.map(([name, value, warning]) => (
                        <TableRow key={name}>
                            <TableHead scope="row" className="whitespace-normal">{name}</TableHead>
                            <TableCell className="whitespace-normal">{value}{warning !== null &&
                                <p>{warning ? 'At or above warning level' : 'Below warning level'}</p>}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <p className="text-sm text-muted-foreground">File metadata excludes unregistered objects. A single database probe does not measure page speed.</p>
        </section>
    );
}
