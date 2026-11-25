import { Link } from '@inertiajs/react';
import { GroupManager, type Group, type Registration } from '../../components/community/GroupManager';
import {
    Announcements,
    CommunityPage,
    EntryForm,
    type Entry,
} from '../../components/community/Elements';

type Props = {
    offering: {
        id: string;
        external_offering_id: string | null;
    };
    canManage: boolean;
    forums: {
        id: string;
        title: string;
    }[];
    groups: Group[];
    registrations: Registration[];
    members: {
        id: string;
        full_name: string;
    }[];
    announcements: Entry[];
};

export default function Board({
    offering,
    canManage,
    forums,
    groups,
    registrations,
    members,
    announcements,
}: Props) {
    const base = `/community/courses/${offering.id}`;

    return (
        <CommunityPage title={`${offering.external_offering_id ?? 'Course'} community`}>
            <Announcements entries={announcements} />
            <section>
                <h2 className="text-xl font-semibold">Discussions</h2>
                {!forums.length && <p>No discussions yet.</p>}
                <ul>
                    {forums.map((forum) => (
                        <li key={forum.id}>
                            <Link className="underline" href={`/community/forums/${forum.id}`}>
                                {forum.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
            {members.length > 0 && (
                <EntryForm action={`${base}/messages`} title="Send private message">
                    <label>
                        Recipient{' '}
                        <select
                            name="recipient_id"
                            className="max-w-full border p-2"
                            required
                            defaultValue=""
                        >
                            <option value="" disabled>
                                Select a participant
                            </option>
                            {members.map((member) => (
                                <option value={member.id} key={member.id}>
                                    {member.full_name}
                                </option>
                            ))}
                        </select>
                    </label>
                </EntryForm>
            )}
            {canManage && (
                <>
                    <GroupManager base={base} groups={groups} registrations={registrations} />
                    <EntryForm
                        action={`${base}/announcements`}
                        title="Publish course announcement"
                    />
                    <EntryForm action={`${base}/forums`} title="Create discussion" body={false}>
                        <label>
                            Title{' '}
                            <input
                                name="title"
                                maxLength={191}
                                required
                                className="block w-full border p-2"
                            />
                        </label>
                        <label>
                            Audience{' '}
                            <select name="group_id" className="max-w-full border p-2">
                                <option value="">Whole course</option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </EntryForm>
                </>
            )}
        </CommunityPage>
    );
}
