import { notificationPreferences } from '@/data/community/preferences';
import { Notifications } from '@/components/community/Notifications';

export default function StudentNotifications() {
    return <Notifications role="student" data={notificationPreferences.student} />;
}
