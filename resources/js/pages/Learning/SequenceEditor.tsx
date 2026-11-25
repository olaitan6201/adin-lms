import { useForm } from '@inertiajs/react';
import type { Activity } from '../Course';

export function SequenceEditor({ activities, action }: { activities: Activity[]; action: string }) {
    const form = useForm({ activities: activities.map((a) => a.id) });
    const titles = new Map(activities.map((a) => [a.id, a.title]));
    function move(i: number, by: number) {
        const next = [...form.data.activities];
        [next[i], next[i + by]] = [next[i + by], next[i]];
        form.setData('activities', next);
    }
    return <details className="my-4">
        <summary>Edit activity sequence</summary>
        <ol className="my-3 space-y-2">
            {form.data.activities.map((id, i) => <li key={id}>
                {i + 1}. {titles.get(id)}{' '}
                <button type="button" className="underline disabled:opacity-50" aria-label={`Move ${titles.get(id)} earlier`}
                    onClick={() => move(i, -1)} disabled={i === 0}>Earlier</button>{' '}
                <button type="button" className="underline disabled:opacity-50" aria-label={`Move ${titles.get(id)} later`}
                    onClick={() => move(i, 1)} disabled={i + 1 === activities.length}>Later</button>
            </li>)}
        </ol>
        <button className="portal-action" disabled={form.processing} onClick={() => form.put(action, { preserveScroll: true })}>Save sequence</button>
        {Object.values(form.errors).map((error) => <p role="alert" key={error}>{error}</p>)}
        {form.recentlySuccessful && <p role="status">Sequence saved.</p>}
    </details>;
}
