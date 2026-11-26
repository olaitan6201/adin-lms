import type { Offering } from '@/types/registry/delivery';
import { Field } from '@/components/registry/Desk';
import { Details, status } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
export function OfferingSettings({
    offering,
    staff,
    previousSessions,
    copyStructure,
    unpublish,
}: {
    offering: Offering;
    staff: { role: string; name: string }[];
    previousSessions: string[];
    copyStructure: () => void;
    unpublish: (record: Offering) => void;
}) {
    return (
        <>
            <Card title="Instructor allocation">
                <div className="space-y-3">
                    <Field
                        label="Lead instructor"
                        value={offering.instructor}
                        options={
                            offering.instructor === 'Unassigned'
                                ? [
                                      'Unassigned',
                                      ...staff
                                          .filter((member) => member.role === 'Lecturer')
                                          .map((member) => member.name),
                                  ]
                                : [offering.instructor, 'Unassigned']
                        }
                    />
                    <Field
                        label="Teaching assistants"
                        value={offering.assistants}
                        options={['2 assigned', 'None']}
                    />
                    <Field
                        label="Access scope"
                        value={offering.scope}
                        options={['Assigned class only', 'Whole course']}
                    />
                </div>
            </Card>
            <Card title="Reusable structure" subtitle="Copy a previous session without grades or registrations">
                <select className="select" aria-label="Previous session">
                    {previousSessions.map((term) => (
                        <option key={term}>
                            {offering.code} · {term}
                        </option>
                    ))}
                </select>
                <Action size="sm" onClick={copyStructure}>
                    Copy structure
                </Action>
                <p className="mt-2 text-xs">
                    Copies weekly modules, resource links and assessment shells. Grades, submissions and
                    registrations are never copied.
                </p>
            </Card>
            <Card title="Publication">
                <Details
                    entries={[
                        ['Approved by HoD', status(offering.state === 'draft' ? 'Pending' : 'Done')],
                        [
                            'Instructor allocated',
                            status(offering.instructor === 'Unassigned' ? 'Pending' : 'Done'),
                        ],
                        ['Roster consumed', status(`${offering.students} enrolled`, 'emerald')],
                        [
                            'Published to students',
                            status(
                                offering.state === 'published' ? 'Live' : 'Not live',
                                offering.state === 'published' ? 'emerald' : 'slate',
                            ),
                        ],
                    ]}
                />
            </Card>
            {offering.state === 'published' && (
                <Card
                    title="Unpublish this offering"
                    subtitle="Withdraws the course from students who are not yet enrolled"
                >
                    <p className="mb-3 text-sm">
                        Unpublishing keeps the existing registrations, submissions and results. Students already
                        enrolled keep access to the material they have been given, and the offering returns to the
                        approved state rather than to draft.
                    </p>
                    <Action variant="danger" onClick={() => unpublish(offering)}>
                        Unpublish {offering.code}
                    </Action>
                    <small> Requires an authorised officer and is written to the audit log.</small>
                </Card>
            )}
        </>
    );
}
