import { NativeSelectOption } from '@/components/ui/native-select';
import { Label } from '@/components/ui/label';
import { Button, buttonVariants } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import { Link } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { CommunityPage, EntryForm, type Entry } from '../../components/community/Elements';

type Props = {
    forum: {
        id: string;
        title: string;
        offering_id: string;
    };
    canModerate: boolean;
    posts: (Entry & {
        author: string;
        parent_id: string | null;
    })[];
};

export default function Discussion({ forum, canModerate, posts }: Props) {
    const action = `/community/forums/${forum.id}/posts`;
    const [reply, setReply] = useState('');
    const composer = useRef<HTMLDivElement>(null);
    const numbers = new Map(posts.map((post, i) => [post.id, i + 1]));

    return (
        <CommunityPage title={forum.title}>
            <Link className="underline" href={`/community/courses/${forum.offering_id}`}>
                Course community
            </Link>
            {!posts.length && <p>No posts yet. Start the discussion below.</p>}
            <ol>
                {posts.map((post, i) => (
                    <li key={post.id} id={`post-${post.id}`} className="border-b py-4">
                        <h2 className="font-semibold">
                            Post {i + 1} · {post.author}
                        </h2>
                        {post.parent_id &&
                            (numbers.has(post.parent_id) ? (
                                <a className="underline" href={`#post-${post.parent_id}`}>
                                    Reply to post {numbers.get(post.parent_id)}
                                </a>
                            ) : (
                                <p>Reply to a hidden post</p>
                            ))}
                        <p className="whitespace-pre-wrap break-words">{post.body}</p>
                        <Button variant="outline" className="mr-4"
                            onClick={() => {
                                setReply(post.id);
                                composer.current?.querySelector('textarea')?.focus();
                            }}
                        >
                            Reply to post {i + 1}
                        </Button>
                        {canModerate && (
                            <Link as="button" className={buttonVariants({ variant: 'outline' })} method="patch" href={`${action}/${post.id}/hide`}>
                                Hide post {i + 1}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
            <div ref={composer}>
                <EntryForm action={action} title="Post to discussion">
                    <Label className="grid gap-2">
                        Reply to{' '}
                        <NativeSelect
                            name="parent_id"
                            value={reply}
                            onChange={(event) => setReply(event.target.value)}
                        >
                            <NativeSelectOption value="">New topic</NativeSelectOption>
                            {posts.map((p, i) => (
                                <NativeSelectOption key={p.id} value={p.id}>
                                    Post {i + 1}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                    </Label>
                </EntryForm>
            </div>
        </CommunityPage>
    );
}
