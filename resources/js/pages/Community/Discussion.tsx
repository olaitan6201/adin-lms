import { Link } from '@inertiajs/react';
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
                        {canModerate && (
                            <Link
                                as="button"
                                className="underline"
                                method="patch"
                                href={`${action}/${post.id}/hide`}
                            >
                                Hide post {i + 1}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
            <EntryForm action={action} title="Post to discussion">
                <label>
                    Reply to{' '}
                    <select name="parent_id" className="border p-2">
                        <option value="">New topic</option>
                        {posts.map((p, i) => (
                            <option key={p.id} value={p.id}>
                                Post {i + 1}
                            </option>
                        ))}
                    </select>
                </label>
            </EntryForm>
        </CommunityPage>
    );
}
