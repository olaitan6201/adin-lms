export type ModerationEvent = {
    action: string;
    at: string;
    actor: string | null;
    reason: string | null;
};
const eventLabels: Record<string, string> = {
    'grade.calculated': 'Result calculated',
    'grade.correct': 'Correction requested',
    'grade.approve': 'Approved for release',
    'grade.publish': 'Result published',
    'grade.export': 'Result sheet downloaded',
};

export function ModerationHistory({ history }: { history: ModerationEvent[] }) {
    return (
        <section className="min-w-0 space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Revision history</h2>
            <ol className="ml-2 space-y-4 border-l pl-5">
                {history.map((e, i) => (
                    <li
                        key={i}
                        className="relative before:absolute before:top-1.5 before:-left-[26px] before:size-2.5 before:rounded-full before:bg-primary"
                    >
                        <strong>{eventLabels[e.action] ?? e.action}</strong> · {e.actor ?? 'System'} ·{' '}
                        <time dateTime={e.at}>{new Date(e.at).toLocaleString()}</time>
                        {e.reason && <p>{e.reason}</p>}
                    </li>
                ))}
            </ol>
        </section>
    );
}
