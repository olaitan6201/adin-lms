import Classroom from '@/components/learning/Classroom';
import { room, archive, liveClasses, schedule } from '@/data/learning/classroom';

export default function AdminClassroom() {
    return <Classroom liveClasses={liveClasses} room={room} archive={archive} scheduleLabel={schedule.label} />;
}
