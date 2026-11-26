import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { Details } from '../RecordDetails';

export function ExamReceipt({
    title,
    submitted,
    deadline,
    answered,
    count,
    stored,
}: {
    title: string;
    submitted: number;
    deadline: number;
    answered: number;
    count: number;
    stored: boolean;
}) {
    return (
        <Card title="Examination submitted" subtitle="Local attempt receipt">
            <Details
                items={[
                    ['Paper', title],
                    ['Submitted', new Date(submitted).toLocaleString()],
                    ['Reason', submitted === deadline ? 'Access window expired' : 'Submitted by candidate'],
                    ['Answered', `${answered} of ${count}`],
                    [
                        'Record',
                        stored ? 'Saved in this browser session' : 'In memory only; storage unavailable',
                    ],
                ]}
            />
            <Action href={workspaceUrl('student/overview')}>Return to dashboard</Action>
        </Card>
    );
}
