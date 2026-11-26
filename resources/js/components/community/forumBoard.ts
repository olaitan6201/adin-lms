import type { Forum, Thread } from '@/types/community/communication';

export type ForumBoard = {
    forums: Forum[];
    topics: Thread[];
};
export type TopicChange =
    | {
        kind: 'reply';
        topicId: string;
        reply: string;
    }
    | {
        kind: 'moderate';
        topicId: string;
        reply: string;
        destination: string;
        pinned: boolean;
        allowReplies: boolean;
    };

export function applyTopicChange(board: ForumBoard, change: TopicChange): ForumBoard {
    const topic = board.topics.find(item => item.id === change.topicId);
    if (!topic) return board;

    const reply = change.reply.trim();
    if (change.kind === 'reply' && (!topic.allowReplies || !reply)) return board;

    const destination = change.kind === 'moderate' ? change.destination : topic.forum;
    if (!board.forums.some(forum => forum.id === destination)) return board;

    const updated: Thread = {
        ...topic,
        forum: destination,
        pinned: change.kind === 'moderate' ? change.pinned : topic.pinned,
        allowReplies: change.kind === 'moderate' ? change.allowReplies : topic.allowReplies,
        replies: topic.replies + (reply ? 1 : 0),
        responses: reply ? [...topic.responses, reply] : topic.responses,
        updated: 'Just now',
    };
    const moved = destination !== topic.forum;
    const forums = board.forums.map(forum => {
        if (forum.id === destination) {
            return {
                ...forum,
                threads: forum.threads + Number(moved),
                posts: forum.posts + Number(Boolean(reply)),
                last: 'Updated just now',
            };
        }

        return moved && forum.id === topic.forum ? { ...forum, threads: forum.threads - 1 } : forum;
    });
    return { forums, topics: board.topics.map(item => item.id === topic.id ? updated : item) };
}
