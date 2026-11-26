import { Action } from '@/components/ui/controls/Action';
import { Drawer } from '../Drawer';
import { Note } from '@/components/ui/feedback/Note';
import { gradeForTotal } from './useGradebook';
import type { GradeRow, GradePolicy } from '@/types/assessments/gradebook';

export function PublicationReview({
    rows,
    policy,
    lecturer,
    close,
    confirmPublication,
}: {
    rows: GradeRow[];
    policy: GradePolicy;
    lecturer: boolean;
    close: () => void;
    confirmPublication: () => void;
}) {
    const approved = rows.filter((r) => r.state === 'approved');
    const releaseDifferences = approved
        .map((row) => ({ row, preview: gradeForTotal(row.total, policy.boundaries) }))
        .filter(({ row, preview }) => row.grade !== preview);

    return (
        <Drawer title="Publish results" close={close}>
            {lecturer ? (
                <Note>Publication is reserved for the authorised examination officer.</Note>
            ) : (
                <>
                    <p>
                        {approved.length} approved result(s) ready to publish. Publication keeps the recorded
                        grade; it does not recalculate it.
                    </p>
                    {releaseDifferences.length > 0 && (
                        <ul className="list-disc pl-5">
                            {releaseDifferences.map(({ row, preview }) => (
                                <li key={row.matric}>
                                    {row.student} ({row.matric}): {row.total} total. Recorded grade:{' '}
                                    {row.grade}. Boundary preview: {preview}.
                                </li>
                            ))}
                        </ul>
                    )}
                    <Action variant="primary" disabled={!approved.length} onClick={confirmPublication}>
                        Confirm publication
                    </Action>
                </>
            )}
        </Drawer>
    );
}
