import { reports } from '@/data/reports/reports';
import { Reports } from '@/components/reports/Reports';

export default function AdminReports() {
    return <Reports data={reports} />;
}
