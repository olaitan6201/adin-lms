import { useState } from 'react';
import { type Desk } from '@/components/registry/Desk';
import { val } from '@/components/registry/Records';
import type { ProgrammeVersion, CurriculumRevision } from '@/types/registry/curriculum';
import { RevisionDetails } from './RevisionDetails';

export function useProgrammeVersions({
    programmeVersions,
    desk,
    setTab,
}: {
    programmeVersions: ProgrammeVersion[];
    desk: Desk;
    setTab: (tab: number) => void;
}) {
    const [versions, setVersions] = useState(programmeVersions);
    function update(id: string, change: (revisions: CurriculumRevision[]) => CurriculumRevision[]) {
        setVersions((records) =>
            records.map((record) => (record.id === id ? { ...record, revisions: change(record.revisions) } : record)),
        );
    }

    function newVersion() {
        desk.show({
            title: 'New curriculum version',
            submit: 'Create draft',
            body: (
                <label className="block">
                    <span className="label">Programme</span>
                    <select className="select block w-full" name="Programme" required>
                        {versions.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.title}
                            </option>
                        ))}
                    </select>
                </label>
            ),
            save: (data) => {
                const programme = versions.find((p) => p.id === val(data, 'Programme'));
                if (!programme) {
                    return 'Select a programme.';
                }

                const latest = programme.revisions[programme.revisions.length - 1];
                if (latest.state !== 'approved') {
                    return 'This programme already has a revision in progress.';
                }

                update(programme.id, (history) => [
                    ...history,
                    { number: latest.number + 1, state: 'draft', approved: null, outcomes: [...latest.outcomes] },
                ]);
                setTab(1);
            },
        });
    }

    function mapOutcomes(programme: ProgrammeVersion) {
        const revision = programme.revisions[programme.revisions.length - 1];
        const body = <RevisionDetails revision={revision} programme={programme} />;
        const panel = {
            title: `Outcome mapping for ${programme.title}`,
            subtitle: `Version ${revision.number} · ${revision.state}${revision.approved ? ` ${revision.approved}` : ''}`,
            body,
        };
        if (revision.state !== 'draft') {
            desk.show(panel);
            return;
        }

        desk.show({
            ...panel,
            submit: 'Submit mapping',
            message: 'Mapping submitted for approval',
            save: (data) => {
                const outcomes = val(data, 'Draft outcomes (one per line)')
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean);
                if (!outcomes.length) {
                    return 'Enter at least one programme outcome.';
                }

                update(programme.id, (history) =>
                    history.map((r) =>
                        r.number === revision.number ? { ...r, state: 'awaiting approval', outcomes } : r,
                    ),
                );
            },
        });
    }

    return { versions, newVersion, mapOutcomes };
}
