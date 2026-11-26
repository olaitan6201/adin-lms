import type { FormEvent } from 'react';
import { Drawer } from '@/components/ui/overlays/DialogDrawer';
import { Field } from '@/components/ui/controls/Field';
import { Note } from '@/components/ui/feedback/Note';
import { Card } from '@/components/ui/layout/Card';
import type { Forum, Thread } from '@/types/community/communication';
import type { TopicChange } from './forumBoard';

type Props = {
    topic: Thread;
    forums: Forum[];
    student: boolean;
    close: () => void;
    save: (change: TopicChange) => void;
};

export function TopicEditor({ topic, forums, student, close, save }: Props) {
    function saveTopic(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        const reply = String(fields.get('reply') ?? '').trim();
        if (student) {
            if (reply && topic.allowReplies) {
                save({ kind: 'reply', topicId: topic.id, reply });
            }

            return;
        }

        save({
            kind: 'moderate',
            topicId: topic.id,
            reply,
            destination: String(fields.get('forum') ?? topic.forum),
            pinned: fields.has('pin'),
            allowReplies: fields.has('allow'),
        });
    }

    return (
        <Drawer
            title={topic.title}
            subtitle={`${forums.find((f) => f.id === topic.forum)?.course} forum · started by ${topic.author} · ${topic.replies} replies`}
            close={close}
        >
            <form className="space-y-4" onSubmit={saveTopic}>
                {!student && (
                    <Card title="Moderation">
                        <div className="space-y-3">
                            <label className="block">
                                <input name="pin" type="checkbox" defaultChecked={topic.pinned} /> Pin this thread to the top of the
                                forum
                            </label>
                            <label className="block">
                                <input name="allow" type="checkbox" defaultChecked={topic.allowReplies} /> Allow student replies
                            </label>
                            <Field label="Move thread">
                                <select className="select" name="forum" defaultValue={topic.forum}>
                                    {forums.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.title}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    </Card>
                )}
                {topic.responses.map((r, i) => (
                    <p key={i} className="rounded-lg bg-brand-50 p-3">
                        <strong>You</strong>
                        <br />
                        {r}
                    </p>
                ))}
                {!student || topic.allowReplies ? (
                    <>
                        <Field label="Reply">
                            <textarea
                                aria-label="Reply"
                                className="input min-h-24"
                                name="reply"
                                required={student}
                                placeholder={student ? 'Write a reply' : topic.suggestedReply ?? 'Write a reply'}
                            />
                        </Field>
                        {!student && (
                            <Note>
                                Course records retain threads and the moderation audit trail. Changes in this sample
                                workspace are local and do not update the course record.
                            </Note>
                        )}
                        <div className="flex justify-end gap-2">
                            <button type="button" className="btn btn-outline" onClick={close}>
                                Close
                            </button>
                            <button className="btn btn-primary">Post reply</button>
                        </div>
                    </>
                ) : (
                    <p>This thread is closed to replies.</p>
                )}
            </form>
        </Drawer>
    );
}
