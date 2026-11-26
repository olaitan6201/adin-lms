import { Counts } from './DeskDetails';
import { LearnerTime } from '@/components/calendar/LearnerTime';
import { InsightPanel, MeasureBars } from './InsightPanel';

import type { Activity } from './ManagementPeriod';
export function ActivitySummary({ activity }: { activity: Activity }) {
    return (
        <InsightPanel
            title="Activity in the last seven days"
            subtitle={
                <>
                    After <LearnerTime instant={activity.from} /> through <LearnerTime instant={activity.until} />.
                </>
            }
        >
            <MeasureBars values={activity.academic} />
            {activity.latest.length > 0 && (
                <>
                    <h3 className="card-title mt-5 border-t border-ink-100 pt-4">Latest academic activity</h3>
                    <ul className="mb-4">
                        {activity.latest.map((row) => (
                            <li key={row.kind} className="py-1">
                                <strong>{row.title}</strong> · {row.course}
                                <br />
                                <span className="text-sm text-muted-foreground">
                                    {row.kind} · <LearnerTime instant={row.at} />
                                </span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
            {activity.usage && (
                <>
                    <h3 className="card-title mt-5 border-t border-ink-100 pt-4">Institution sign-ins</h3>
                    <Counts values={activity.usage} />
                    <p className="text-sm text-muted-foreground">
                        Accepted password and institutional sign-ins; does not indicate MFA completion.
                    </p>
                </>
            )}
        </InsightPanel>
    );
}
