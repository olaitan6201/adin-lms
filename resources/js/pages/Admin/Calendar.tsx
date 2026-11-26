import { schedule } from '@/data/calendar/schedule';
import { Calendar } from '@/components/calendar/Calendar';

export default function AdminCalendar() {
    return <Calendar role="admin" data={schedule} />;
}
