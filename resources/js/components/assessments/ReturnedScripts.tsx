import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import type { StudentWork } from '@/types/assessments/assignments';
import { Drawer } from './Drawer';

export function ReturnedScripts({ records }: { records: StudentWork[] }) {
    const [receiptNumber, selectReceipt] = useState<string>();
    const results = records.flatMap(({ assignment, current, previous }) => {
        const revisions = current ? [current, ...previous] : previous;
        return revisions.flatMap(({ receipt, feedback }) =>
            feedback
                ? [
                      {
                          assignment,
                          receipt,
                          feedback,
                          previous: receipt.number !== current?.receipt.number,
                      },
                  ]
                : [],
        );
    });
    const selected = results.find((result) => result.receipt.number === receiptNumber);

    return (
        <>
            <Card title="Feedback waiting" subtitle="Marked work returned to you">
                <div className="space-y-3">
                    {results.map(({ assignment, receipt, feedback, previous }) => (
                        <article key={receipt.number} className="rounded-xl border border-ink-100 p-3.5">
                            <p className="text-[13px] font-medium text-ink-800">
                                {assignment.shortTitle ?? assignment.title}
                            </p>
                            <p className="text-xs text-ink-500">
                                {previous ? 'Previous result' : 'Current result'} · {receipt.file}
                            </p>
                            <p className="mt-1 text-[13px] leading-relaxed text-ink-600">{feedback.text}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <Badge tone="emerald">{feedback.score} / 100</Badge>
                                <Action size="sm" onClick={() => selectReceipt(receipt.number)}>
                                    Script
                                </Action>
                            </div>
                        </article>
                    ))}
                </div>
            </Card>
            {selected && (
                <Drawer
                    title="Marked script"
                    subtitle={selected.assignment.title}
                    close={() => selectReceipt(undefined)}
                >
                    <Card title={selected.previous ? 'Previous result' : 'Current result'}>
                        <p>
                            {selected.receipt.file} · {selected.receipt.size} · uploaded{' '}
                            {selected.receipt.time}
                        </p>
                        <p>Receipt no. {selected.receipt.number}</p>
                        <Badge tone="emerald">{selected.feedback.score} / 100</Badge>
                    </Card>
                    <Card title="Marker feedback">{selected.feedback.text}</Card>
                </Drawer>
            )}
        </>
    );
}
