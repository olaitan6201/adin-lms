import { notificationPreferences } from '@/data/community/preferences';
import { Notifications } from '@/components/community/Notifications';

export default function LecturerNotifications() {
    return <Notifications role="lecturer" data={notificationPreferences.lecturer} />;
}
