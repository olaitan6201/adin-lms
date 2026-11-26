import Classroom from '@/components/learning/Classroom';
import { liveClasses } from '@/data/learning/courseWorkspace';
import { room, archive, session, schedule } from '@/data/learning/classroom';

export default function LecturerClassroom() {
    return <Classroom liveClasses={liveClasses} room={room} archive={archive} session={session} scheduleLabel={schedule.label} />;
}
