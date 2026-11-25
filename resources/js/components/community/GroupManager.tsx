import { EntryForm } from './Elements';

export type Group = { id: string; name: string; members: { enrolment_id: string }[] };
export type Registration = { id: string; label: string };

export function GroupManager({ base, groups, registrations }: { base: string; groups: Group[]; registrations: Registration[] }) {
    const editor = (team?: Group) => (
        <EntryForm action={`${base}/groups${team ? `/${team.id}` : ''}`} title={team ? 'Save membership' : 'Create study group'} body={false}>
            <label>Group name<input className="block w-full border p-2" name="name" required maxLength={191} defaultValue={team?.name} /></label>
            <fieldset><legend>Registered learners</legend>
                {registrations.map(person => (
                    <label key={person.id} className="flex items-center gap-2 py-1">
                        <input type="checkbox" name="members[]" value={person.id} defaultChecked={team?.members.some(member => member.enrolment_id === person.id)} />
                        {person.label}
                    </label>
                ))}
            </fieldset>
        </EntryForm>
    );
    return <section className="space-y-3">
        <h2 className="text-xl font-semibold">Study groups</h2>
        {groups.map(team => <details key={team.id}>
            <summary className="cursor-pointer py-2">{team.name} · Edit membership</summary>
            {editor(team)}
        </details>)}
        <details><summary className="cursor-pointer py-2">New study group</summary>{editor()}</details>
    </section>;
}
