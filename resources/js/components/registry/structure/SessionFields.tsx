import { Field } from '@/components/registry/Desk';
import { Note } from '@/components/ui/feedback/Note';
import { Details } from '@/components/registry/Records';
import type { AcademicSession } from '@/types/registry/structure';

export function SessionFields({
    session,
    windows,
}: {
    session: AcademicSession;
    windows: Record<string, [string, string][]>;
}) {
    return (
        <>
            <Field label="Session label" value={session.label} required />
            <div className="grid grid-cols-2 gap-3">
                <Field
                    label="Resumption date"
                    type="date"
                    value={session.startDate}
                    required
                />
                <Field
                    label="Session end"
                    type="date"
                    value={session.endDate}
                    required
                />
            </div>
            <Field label="Semester" value={session.semester} options={['First Semester', 'Second Semester']} />
            <section className="rounded-xl border border-ink-100 p-4">
                <p className="text-[13px] font-semibold">Semester windows</p>
                {windows[session.id] ? (
                    <Details entries={windows[session.id]} />
                ) : (
                    <p>No semester windows recorded for this session.</p>
                )}
            </section>
            <Note>
                Roster imports and result publication are scoped to the active session. Changing these dates does not
                alter historical records.
            </Note>
        </>
    );
}
