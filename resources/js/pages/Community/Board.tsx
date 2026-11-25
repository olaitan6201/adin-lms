import { NativeSelectOption } from '@/components/ui/native-select';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Input } from '@/components/ui/input';
import { Link } from '@inertiajs/react';
import { GroupManager, type Group, type Registration } from '../../components/community/GroupManager';
import { Announcements, CommunityPage, EntryForm, type Entry } from '../../components/community/Elements';

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

export default function Board({ offering, canManage, forums, groups, registrations, members, announcements }: Props) {
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
                    <Label className="grid gap-2">
                        Recipient{' '}
                        <NativeSelect className="max-w-full" name="recipient_id" required defaultValue="">
                            <NativeSelectOption value="" disabled>
                                Select a participant
                            </NativeSelectOption>
                            {members.map((member) => (
                                <NativeSelectOption value={member.id} key={member.id}>
                                    {member.full_name}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                    </Label>
                </EntryForm>
            )}
            {canManage && (
                <>
                    <GroupManager base={base} groups={groups} registrations={registrations} />
                    <EntryForm action={`${base}/announcements`} title="Publish course announcement" />
                    <EntryForm action={`${base}/forums`} title="Create discussion" body={false}>
                        <Label className="grid gap-2">
                            Title <Input name="title" maxLength={191} required />
                        </Label>
                        <Label className="grid gap-2">
                            Audience{' '}
                            <NativeSelect className="max-w-full" name="group_id">
                                <NativeSelectOption value="">Whole course</NativeSelectOption>
                                {groups.map((group) => (
                                    <NativeSelectOption key={group.id} value={group.id}>
                                        {group.name}
                                    </NativeSelectOption>
                                ))}
                            </NativeSelect>
                        </Label>
                    </EntryForm>
                </>
            )}
        </CommunityPage>
    );
}
