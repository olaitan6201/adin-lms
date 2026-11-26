import { CourseDisclosure } from '@/components/learning/CourseDisclosure';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import type { Activity } from './contracts';

type SequenceEditorProps = {
    activities: Activity[];
    action: string;
};

export function SequenceEditor({ activities, action }: SequenceEditorProps) {
    const form = useForm({ activities: activities.map((a) => a.id) });
    const titles = new Map(activities.map((a) => [a.id, a.title]));
    function move(i: number, by: number) {
        const next = [...form.data.activities];
        [next[i], next[i + by]] = [next[i + by], next[i]];
        form.setData('activities', next);
    }

    return (
        <CourseDisclosure className="my-4" label="Edit activity sequence">
            <ol className="my-3 space-y-2">
                {form.data.activities.map((id, i) => (
                    <li key={id}>
                        {i + 1}. {titles.get(id)}{' '}
                        <Button variant="outline"
                            type="button"
                            aria-label={`Move ${titles.get(id)} earlier`}
                            onClick={() => move(i, -1)}
                            disabled={i === 0}
                        >
                            Earlier
                        </Button>{' '}
                        <Button variant="outline"
                            type="button"
                            aria-label={`Move ${titles.get(id)} later`}
                            onClick={() => move(i, 1)}
                            disabled={i + 1 === activities.length}
                        >
                            Later
                        </Button>
                    </li>
                ))}
            </ol>
            <Button
                disabled={form.processing}
                onClick={() => form.put(action, { preserveScroll: true })}
            >
                Save sequence
            </Button>
            {Object.values(form.errors).map((error) => (
                <p role="alert" key={error}>
                    {error}
                </p>
            ))}
            {form.recentlySuccessful && <p role="status">Sequence saved.</p>}
        </CourseDisclosure>
    );
}
