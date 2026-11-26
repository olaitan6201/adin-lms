import { schedule } from '@/data/calendar/schedule';
import { Calendar } from '@/components/calendar/Calendar';

export default function StudentCalendar() {
    return <Calendar role="student" data={schedule} />;
}
