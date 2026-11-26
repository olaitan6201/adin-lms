import { cap, Records, status } from '@/components/registry/Records';

type Findings = { title: string; severity: string; course: string; owner: string; age: string; state: string }[];

export function ReviewFindings({ findings }: { findings: Findings }) {
    return (
        <Records
            title="Findings"
            subtitle="A finding is closed only by the person who raised it"
            columns={['Finding', 'Course', 'Owner', 'Age', 'State']}
            rows={findings.map((finding) => [
                <span key="finding" className="flex items-center gap-2 text-[13px] font-medium text-ink-800">
                    <span
                        className={`size-2 shrink-0 rounded-full ${finding.severity === 'high' ? 'bg-rose-500' : finding.severity === 'medium' ? 'bg-amber-500' : 'bg-ink-300'}`}
                    />
                    {finding.title}
                </span>,
                <span key="course" className="text-[12.5px] text-ink-600">
                    {finding.course}
                </span>,
                <span key="owner" className="text-[12.5px] text-ink-600">
                    {finding.owner}
                </span>,
                <span key="age" className="text-[12.5px] text-ink-500">
                    {finding.age}
                </span>,
                status(cap(finding.state), finding.state === 'resolved' ? 'emerald' : finding.state === 'acknowledged' ? 'sky' : 'amber'),
            ])}
        />
    );
}
