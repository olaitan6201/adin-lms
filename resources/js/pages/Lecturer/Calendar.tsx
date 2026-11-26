import { schedule } from '@/data/calendar/schedule';
import { Calendar } from '@/components/calendar/Calendar';

export default function LecturerCalendar() {
    return <Calendar role="lecturer" data={schedule} />;
}
