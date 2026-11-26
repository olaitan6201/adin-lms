import type { CommunicationData } from '@/types/community/communication';
import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { Forums } from './Forums';
import { Groups } from './Groups';
import { Messages } from './Messages';
import { Announcements } from './Announcements';
import { Note } from '@/components/ui/feedback/Note';
import { Sections, type SectionItem } from '@/components/ui/navigation/Sections';
import { useConversations } from './useConversations';
import { type TeachingRole } from '@/types/identity/roles';

type Section = 'forums' | 'groups' | 'messages' | 'announcements';

export function Communication({ role, data }: { data: CommunicationData; role: TeachingRole }) {
    const student = role === 'student';
    const [tab, setTab] = useState<Section>('forums');
    const [compose, setCompose] = useState(false);
    const [notice, setNotice] = useState('');
    const inbox = useConversations(data.messages);
    const items: SectionItem<Section>[] = [
        {
            id: 'forums',
            label: student ? 'Course forums' : 'Forums and threads',
            panel: <Forums forums={data.forums} threads={data.threads} student={student} />,
        },
        {
            id: 'groups',
            label: student ? 'My groups' : 'Group discussions',
            panel: <Groups discussionGroups={data.groups} groupPosts={data.posts} student={student} />,
        },
        {
            id: 'messages',
            label: 'Messages',
            count: inbox.unread,
            panel: <Messages inbox={inbox} recipients={data.messages} composing={compose} close={() => setCompose(false)} />,
        },
    ];
    if (!student) {
        items.push({
            id: 'announcements',
            label: 'Announcements',
            panel: (
                <Announcements
                    notices={data.announcements}
                    publicationDate={data.publicationDate}
                    audiences={data.audiences}
                    selected={notice}
                    select={setNotice}
                />
            ),
        });
    }

    function composeNew() {
        if (student) {
            setTab('messages');
            setCompose(true);
        } else {
            setTab('announcements');
            setNotice('new');
        }
    }

    return (
        <div className="engagement-workspace space-y-5 [&_[role=tab]>span]:text-ink-600">
            <PageHeader
                eyebrow="Communication"
                title="Communication"
                description={
                    student
                        ? 'Ask questions in course forums, message your lecturers directly, and read the notices published for your cohort.'
                        : 'Moderated course forums, private messages, and announcements to cohorts and to the whole institution.'
                }
                actions={
                    <>
                        <Action icon="bell" href={workspaceUrl(`${role}/settings/notifications`)}>
                            Notification settings
                        </Action>
                        <Action variant="primary" icon="send" onClick={composeNew}>
                            {student ? 'New message' : 'New announcement'}
                        </Action>
                    </>
                }
            />
            <Sections items={items} active={tab} change={setTab} />
            <Note>
                Messages and forum posts are scoped to the writer and the intended audience. Guardians see only progress that has been
                explicitly approved for them.
            </Note>
        </div>
    );
}
