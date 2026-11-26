import { notificationPreferences } from '@/data/community/preferences';
import { Notifications } from '@/components/community/Notifications';

export default function AdminNotifications() {
    return <Notifications role="admin" data={notificationPreferences.admin} />;
}
