import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import type { FixtureStructure, Offering } from '@/types/registry/delivery';

export function ReusableStructure({
    offering,
    previousSessions,
    structureSources,
}: {
    offering: Offering;
    previousSessions: string[];
    structureSources: FixtureStructure[];
}) {
    const [term, setTerm] = useState(previousSessions[0] ?? '');
    const [pending, setPending] = useState<FixtureStructure>();
    const available = structureSources.find((source) => source.code === offering.code && source.term === term);
    const copied = pending ?? offering.copiedStructure;

    function changeTerm(value: string) {
        setTerm(value);
        setPending(undefined);
    }

    return (
        <Card
            title="Reusable structure"
            subtitle="Only modules and resources are copied; grades, submissions and registrations are excluded."
        >
            <select
                className="select"
                aria-label="Previous session"
                value={term}
                onChange={(event) => changeTerm(event.target.value)}
            >
                {previousSessions.map((session) => (
                    <option key={session} value={session}>
                        {offering.code} · {session}
                    </option>
                ))}
            </select>
            <Action size="sm" disabled={!available || copied?.term === term} onClick={() => setPending(available)}>
                Copy structure
            </Action>
            <p className="mt-2 text-xs">
                {available
                    ? `Sample source · Modules: ${available.modules.length} · Resources: ${available.resources.length}`
                    : `No reusable structure is available for ${offering.code} · ${term}.`}
            </p>
            {copied && (
                <section className="mt-2 text-sm" aria-live="polite">
                    <b>{pending ? 'Ready to copy — save offering to apply' : 'Copied structure'} · {copied.term}</b>
                    <ul>
                        {copied.modules.map((title) => (
                            <li key={title}>Module: {title}</li>
                        ))}
                        {copied.resources.map((name) => (
                            <li key={name}>Resource: {name}</li>
                        ))}
                    </ul>
                </section>
            )}
            {pending && <input type="hidden" name="structureSource" value={pending.term} />}
        </Card>
    );
}
