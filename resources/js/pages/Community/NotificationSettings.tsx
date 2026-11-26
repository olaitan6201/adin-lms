import { Link } from '@inertiajs/react';
import { CommunityPage } from '../../components/community/Elements';
import { RecordPanel } from '@/components/shared/records/WorkspaceRecord';

type Props = {
    email: string;
    profileUrl: string;
    sessionsUrl: string | null;
};

const categories = [
    ['Courses and materials', 'Course publication and newly released learning materials.'],
    ['Assignments and submissions', 'New assignments, upcoming deadlines and submissions ready for staff review.'],
    ['Examinations and results', 'Scheduled examinations and results released to the individual student.'],
    ['Announcements', 'Institutional announcements and notices for your courses.'],
];

export default function NotificationSettings({ email, profileUrl, sessionsUrl }: Props) {
    return (
        <CommunityPage
            title="Notification settings"
            description="See which academic notices reach you and where to find them."
        >
            <RecordPanel
                title="What you are notified about"
                description="Your courses and role determine which notices appear in your inbox."
            >
                <dl className="divide-y divide-ink-100">
                    {categories.map(([name, description]) => (
                        <div key={name} className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[12rem_1fr]">
                            <dt className="font-medium text-ink-900">{name}</dt>
                            <dd className="text-ink-600">{description}</dd>
                        </div>
                    ))}
                </dl>
            </RecordPanel>
            <div className="grid gap-5 xl:grid-cols-2">
                <RecordPanel title="Delivery channels" description="Academic notices appear in your community inbox.">
                    <div>
                        <h3 className="font-medium">Email</h3>
                        <p className="text-ink-600">
                            An email alert is queued for {email}. Sign in to read the full notice.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-medium">SMS and push notifications</h3>
                        <p className="text-ink-600">These channels are not available for academic notices.</p>
                    </div>
                    <Link className="btn btn-outline btn-sm justify-self-start" href={profileUrl}>
                        View my profile
                    </Link>
                </RecordPanel>
                <RecordPanel title="Timing and devices" description="Delivery settings are read-only.">
                    <div>
                        <h3 className="font-medium">Quiet hours, digests and escalation</h3>
                        <p className="text-ink-600">
                            The portal does not offer personal schedules or escalation rules for these notices.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-medium">Signed-in devices</h3>
                        <p className="text-ink-600">There is no personal device list for notification delivery.</p>
                    </div>
                    {sessionsUrl && (
                        <Link className="btn btn-outline btn-sm justify-self-start" href={sessionsUrl}>
                            View institutional sessions
                        </Link>
                    )}
                </RecordPanel>
            </div>
        </CommunityPage>
    );
}
