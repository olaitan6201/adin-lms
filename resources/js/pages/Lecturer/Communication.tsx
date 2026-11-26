import { communication } from '@/data/community/communication';
import { Communication } from '@/components/community/Communication';

export default function LecturerCommunication() {
    return <Communication role="lecturer" data={communication} />;
}
