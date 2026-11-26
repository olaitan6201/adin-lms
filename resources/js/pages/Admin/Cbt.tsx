import CbtDesk from '@/components/assessments/CbtDesk';
import { cbtDesk } from '@/data/assessments/cbt';

export default function AdminCbt() {
    return <CbtDesk {...cbtDesk} officer />;
}
