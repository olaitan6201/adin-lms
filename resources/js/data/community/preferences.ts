import type { NotificationPreferences } from '@/types/community/notifications';
import type { WorkspaceRole } from '@/types/identity/roles';

function category(title: string, description: string, digest: string, push: boolean, sms: boolean) {
    return { title, description, digest, channels: [
        { label: 'Email', enabled: true }, { label: 'Push notification', enabled: push }, { label: 'SMS', enabled: sms },
    ] };
}

const categories = [
    category('Assignments and submissions', 'New assignments, deadline reminders and submission receipts.', 'Daily', true, false),
    category('Results and grading', 'Published results, moderation outcomes and grade changes.', 'Immediate', true, true),
    category('Examinations', 'Invigilation schedules, access windows and candidate instructions.', 'Immediate', true, false),
    category('Announcements and messages', 'Course announcements, forum replies and direct messages.', 'Daily', false, false),
    category('Security and access', 'New device sign-in, password changes and MFA enrolment.', 'Immediate', true, true),
    category('Approvals and escalations', 'Items waiting for a decision and items escalated to the next officer.', 'Weekly', false, false),
];
const switches = [
    { name: 'Announcements from the institution', description: 'Notices published to every role by the Registrar or the ICT Directorate.', enabled: false },
    { name: 'Course announcements only', description: 'Messages from lecturers in the courses you teach or are registered for.', enabled: false },
    { name: 'Security notices always break through quiet hours', description: 'A new device sign-in or a failed second factor is delivered immediately.', enabled: true },
    { name: 'Weekly administrative digest', description: 'Approvals, usage and compliance items in one summary each Friday.', enabled: false },
];
const devices = [
    { device: 'Chrome on Windows 11', location: 'Ubulu-Unor, campus network', last: 'Today, 08:12', state: 'Current session', current: true },
    { device: 'Safari on iPhone 15', location: 'Warri, mobile network', last: '24 Nov 2026, 19:40', state: 'Signed in', current: false },
    { device: 'Edge on Windows 10', location: 'Port Harcourt, residential network', last: '19 Nov 2026, 08:03', state: 'Signed in', current: false },
];
const adminNotice = 'Institution-wide defaults are set in Administration under Delivery channels.';
const userNotice = 'Institution-wide defaults are set by the ICT Directorate.';

function preferences(defaultsNotice: string): NotificationPreferences {
    return {
        defaultsNotice: `${defaultsNotice} These preferences apply to your own account only.`,
        categories, switches, devices,
        quietHours: { start: '21:00', end: '07:00', description: 'Non-urgent notifications are held between 21:00 and 07:00 and delivered as one digest at 07:00.' },
        escalation: { description: 'An approval waiting more than two working days is escalated to the next officer in the chain.', timing: 'Next officer notified after 2 working days' },
    };
}

export const notificationPreferences: Record<WorkspaceRole, NotificationPreferences> = {
    admin: preferences(adminNotice), lecturer: preferences(userNotice), student: preferences(userNotice), guardian: preferences(userNotice),
};
