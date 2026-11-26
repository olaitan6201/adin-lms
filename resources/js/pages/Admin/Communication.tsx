import { communication } from '@/data/community/communication';
import { Communication } from '@/components/community/Communication';

export default function AdminCommunication() {
    return <Communication role="admin" data={communication} />;
}
