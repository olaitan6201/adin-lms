import type { CommunicationData } from '@/types/community/communication';
import { discussionGroups, forums, groupPosts, messages, threads } from './engagement';

const notices = [
    { id: 'a1', title: 'Mid-term examination timetable published', audience: 'All faculties', date: '26 Nov 2026', channels: ['In-platform','Email'], status: 'Sent', body: 'The mid-term timetable for the 2025/2026 first semester is now available in the examinations section. Candidates should confirm their venue and start time at least 24 hours before the examination.' },
    { id: 'a2', title: 'Library access extended over the examination period', audience: 'All students', date: '25 Nov 2026', channels: ['In-platform'], status: 'Sent', body: 'Library access is extended over the examination period.' },
    { id: 'a3', title: 'Lecturer workshop on CBT question design', audience: 'Academic staff', date: '20 Nov 2026', channels: ['In-platform','Email'], status: 'Draft', body: 'Workshop on CBT question design for academic staff.' },
];

const conversations = messages.map((m,i) => ({ ...m, conversation: i === 0 ? [
    { mine: false, body: 'Some of you asked whether the deadline can move to Friday because of the mid-term on the 18th. I have extended the submission window to Friday 20 November 23:59 for everyone, not only for those who asked.' },
    { mine: true, body: 'Thank you. Will the mark split stay the same, or will the rubric change for the extended window?' },
] : [{ mine: false, body: m.preview }] }));

export const communication: CommunicationData = {
    forums, posts: groupPosts, messages: conversations, announcements: notices,
    publicationDate: '26 Nov 2026', audiences: ['All faculties', 'All students', 'Academic staff', 'Course cohort'],
    groups: discussionGroups.map(group => ({ ...group, files: group.id === 'g-1' ? ['Consolidation working draft v3.pdf','Examiner handover note.docx','Trial balance extract.xlsx','Group presentation outline.pptx'] : undefined })),
    threads: threads.map((thread, index) => ({
        ...thread, forum: forums[index].id, pinned: false, allowReplies: true, responses: [],
        suggestedReply: thread.id === 't-1' ? "Historical cost is a measurement convention, not a claim about value. The gain raises the carrying amount only if the standard permits revaluation, and that treatment is separate from the depreciation charge." : undefined,
    })),
};
