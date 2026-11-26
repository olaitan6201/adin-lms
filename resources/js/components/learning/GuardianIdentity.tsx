import { StudyIcon } from './Parts';
import { Timeline } from '@/components/learning/Parts';
import { Badge, Card } from '@/components/workspace/Elements';

const LINKED_STUDENT = {
    name: 'Blessing Okonkwo',
    matric: 'AOU/2023/0412',
    programme: 'B.Sc. Accounting and Finance',
    level: 300,
    linkedBy: 'Registrar, on the guardian consent form',
    linkedOn: '08 Sep 2026',
    consent: 'Progress only, until 30 Jun 2027',
    expires: '30 Jun 2027',
};
const WITHHELD = [
    'Scores still in moderation or awaiting approval',
    'Submissions that have not yet been marked',
    'Examination papers, questions and invigilation records',
    'Messages and forum posts that are not announcements',
    'Results for any other student, and any other guardian',
    'Lecturer notes, rubrics and internal review comments',
];

export function GuardianIdentity() {
    return (
        <Card title="Student you are linked to" subtitle="Linking is by the Registrar, never by the guardian">
            <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800">
                            BO
                        </span>
                        <div>
                            <p className="text-[15px] font-semibold text-ink-900">{LINKED_STUDENT.name}</p>
                            <p className="mt-0.5 font-mono text-[12px] text-ink-500">{LINKED_STUDENT.matric}</p>
                            <p className="mt-1 text-[12.5px] text-ink-600">
                                {LINKED_STUDENT.programme} · {`Level ${LINKED_STUDENT.level}`}
                            </p>
                        </div>
                    </div>
                    <Badge tone="emerald">Consent active</Badge>
                </div>
                <div className="mt-4 border-t border-ink-100 pt-3">
                    <Timeline
                        items={[
                            { title: 'Linked to this guardian account', meta: LINKED_STUDENT.linkedOn, body: LINKED_STUDENT.linkedBy },
                            { title: 'Scope of consent', meta: 'Reviewed each semester', body: LINKED_STUDENT.consent },
                            {
                                title: 'Consent expires',
                                meta: LINKED_STUDENT.expires,
                                body: 'Access ends automatically unless the Registrar renews the consent.',
                            },
                        ]}
                    />
                </div>
            </>
        </Card>
    );
}

export function Withheld() {
    return (
        <Card title="Not visible to a guardian" subtitle="Stated here so that the boundary is not a matter of trust">
            <ul className="space-y-2.5">
                {WITHHELD.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                            <StudyIcon name="close" className="w-3 h-3" />
                        </span>
                        <span className="text-[13px] leading-relaxed text-ink-700">{item}</span>
                    </li>
                ))}
            </ul>
        </Card>
    );
}
