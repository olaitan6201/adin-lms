import { MembershipHistory, type GroupHistory } from './MembershipHistory';
import { CourseDisclosure } from '@/components/learning/CourseDisclosure';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { EntryForm } from './Elements';

export type Group = {
    id: string;
    name: string;
    members: { enrolment_id: string }[];
    history: GroupHistory[];
};

export type Registration = {
    id: string;
    label: string;
};

export function GroupManager({
    base,
    groups,
    registrations,
}: {
    base: string;
    groups: Group[];
    registrations: Registration[];
}) {
    const editor = (team?: Group) => (
        <EntryForm
            action={`${base}/groups${team ? `/${team.id}` : ''}`}
            title={team ? 'Save membership' : 'Create study group'}
            body={false}
            resetOnSuccess={!team}
        >
            <Label className="grid gap-2">
                Group name
                <Input
                    name="name"
                    required
                    maxLength={191}
                    defaultValue={team?.name}
                />
            </Label>
            <fieldset>
                <legend>Registered learners</legend>
                {registrations.map((person) => (
                    <Label key={person.id} className="flex items-center gap-2 py-1">
                        <Checkbox
                            name="members[]"
                            value={person.id}
                            defaultChecked={team?.members.some((member) => member.enrolment_id === person.id)}
                        />
                        {person.label}
                    </Label>
                ))}
            </fieldset>
        </EntryForm>
    );

    return (
        <section id="study-groups" aria-labelledby="study-groups-heading" className="space-y-3">
            <h2 id="study-groups-heading" className="text-xl font-semibold">
                Study groups
            </h2>
            {!groups.length && <p>No study groups yet.</p>}
            {groups.map((team) => (
                <CourseDisclosure key={team.id} label={`${team.name} · Edit membership`}>
                    {editor(team)}
                    <CourseDisclosure className="mt-3 border-t pt-3" label="Membership history">
                        <MembershipHistory entries={team.history} />
                    </CourseDisclosure>
                </CourseDisclosure>
            ))}
            <CourseDisclosure label="New study group">{editor()}</CourseDisclosure>
        </section>
    );
}
