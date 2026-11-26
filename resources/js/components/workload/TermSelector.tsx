import { NativeSelectOption } from '@/components/ui/native-select';
import { NativeSelect } from '@/components/ui/native-select';
import { Button } from '@/components/ui/button';
import type { WorkloadData } from './contracts';

export function TermSelector({ workload }: { workload: Pick<WorkloadData, 'terms' | 'selected_term'> }) {
    return (
        <section aria-labelledby="term-heading" className="course-panel course-pad">
            <h2 id="term-heading" className="text-xl font-semibold tracking-tight">
                Select a term
            </h2>
            <form action="/workload" method="get" className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                    <label htmlFor="term" className="text-sm font-medium">
                        Academic term
                    </label>
                    <NativeSelect
                        className="mt-1"
                        id="term"
                        name="term"
                        defaultValue={workload.selected_term ?? ''}
                        disabled={workload.terms.length === 0}
                    >
                        {workload.terms.length === 0 && <NativeSelectOption value="">No allocated terms</NativeSelectOption>}
                        {workload.terms.map((term) => (
                            <NativeSelectOption key={term.id} value={term.id}>
                                {term.label}
                            </NativeSelectOption>
                        ))}
                    </NativeSelect>
                </div>
                <Button type="submit" disabled={workload.terms.length === 0}>
                    View workload
                </Button>
            </form>
        </section>
    );
}
