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
import { Sections } from '@/components/ui/navigation/Sections';
import { type TeachingRole } from '@/types/identity/roles';

export function Communication({ role, data }: { data: CommunicationData; role: TeachingRole }) {
    const student = role === 'student';
    const names = [student ? 'Course forums' : 'Forums and threads', student ? 'My groups' : 'Group discussions', 'Messages', ...student ? [] : ['Announcements']];
    const [tab, setTab] = useState(names[0]);
    const [compose, setCompose] = useState(false);
    const [notice, setNotice] = useState('');
    const [unread, setUnread] = useState(() => data.messages.reduce((sum, m) => sum + m.unread, 0));
    return <div className="engagement-workspace space-y-5 [&_[role=tab]>span]:text-ink-600"><PageHeader eyebrow="Communication" title="Communication"
        description={student ? 'Ask questions in course forums, message your lecturers directly, and read the notices published for your cohort.' : 'Moderated course forums, private messages, and announcements to cohorts and to the whole institution.'}
        actions={<><Action icon="bell" href={workspaceUrl(`${role}/settings/notifications`)}>Notification settings</Action>
            <Action variant="primary" icon="send" onClick={() => {
                setTab(student ? 'Messages' : 'Announcements');
                if (student) setCompose(true);
                else setNotice('new');
            }}>{student ? 'New message' : 'New announcement'}</Action></>}/>
        <Sections names={names} active={tab} change={setTab} messageCount={unread} panels={[
            <Forums forums={data.forums} threads={data.threads} student={student}/>, <Groups discussionGroups={data.groups} groupPosts={data.posts} student={student}/>, <Messages messages={data.messages} composing={compose} close={() => setCompose(false)} read={count => setUnread(n => n-count)}/>,
            <Announcements notices={data.announcements} publicationDate={data.publicationDate} audiences={data.audiences} selected={notice} select={setNotice}/>,
        ]}/>
        <Note>Messages and forum posts are scoped to the writer and the intended audience. Guardians see only progress that has been explicitly approved for them.</Note>
    </div>;
}
