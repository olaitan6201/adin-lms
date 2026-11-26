import Classroom from '@/components/learning/Classroom';
import { room, archive, liveClasses } from '@/data/learning/classroom';

export default function LecturerClassroom() {
    return <Classroom liveClasses={liveClasses} room={room} archive={archive} />;
}
