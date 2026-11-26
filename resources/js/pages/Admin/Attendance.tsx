import AttendanceDesk from '@/components/assessments/AttendanceDesk';
import { attendanceDesk } from '@/data/assessments/attendance';

export default function AdminAttendance() {
    return <AttendanceDesk {...attendanceDesk} />;
}
