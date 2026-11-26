export type Forum = { id: string; title: string; course: string; threads: number; posts: number; last: string; pinned: boolean };
export type Thread = {
    id: string; title: string; author: string; replies: number; updated: string; tag: string;
    forum: string; pinned: boolean; allowReplies: boolean; responses: string[]; suggestedReply?: string;
};
export type Group = {
    id: string; name: string; course: string; members: string[]; posts: number; sharedFiles: number;
    files?: string[]; task: string; due: string; lastActivity: string;
};
export type GroupPost = { id: string; group: string; author: string; role: string; time: string; body: string; replyTo: string | null };
export type Conversation = {
    id: string; name: string; subject: string; preview: string; time: string; unread: number;
    conversation: { mine: boolean; body: string }[];
};
export type Announcement = { id: string; title: string; audience: string; date: string; channels: string[]; status: string; body: string };
export type CommunicationData = {
    forums: Forum[]; threads: Thread[]; groups: Group[]; posts: GroupPost[]; messages: Conversation[];
    announcements: Announcement[]; publicationDate: string; audiences: string[];
};
