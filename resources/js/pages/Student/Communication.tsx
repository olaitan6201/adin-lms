import { communication } from '@/data/community/communication';
import { Communication } from '@/components/community/Communication';

export default function StudentCommunication() {
    return <Communication role="student" data={communication} />;
}
