import { NativeSelect } from '@/components/ui/native-select';
import { Button } from '@/components/ui/button';
import type { WorkloadData } from './contracts';

export function TermSelector({ workload }: { workload: Pick<WorkloadData, 'terms' | 'selected_term'> }) {
    return (
        <section aria-labelledby="term-heading" className="min-w-0 rounded-lg border p-4 sm:p-6 mt-8">
            <h2 id="term-heading" className="text-xl font-semibold tracking-tight">
                Select a term
            </h2>
            <form action="/workload" method="get" className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                    <label htmlFor="term" className="text-sm font-medium">
                        Academic term
                    </label>
                    <NativeSelect className="mt-1"
                        id="term"
                        name="term"
                        defaultValue={workload.selected_term ?? ''}
                        disabled={workload.terms.length === 0}
                    >
                        {workload.terms.length === 0 && <option value="">No allocated terms</option>}
                        {workload.terms.map((term) => (
                            <option key={term.id} value={term.id}>
                                {term.label}
                            </option>
                        ))}
                    </NativeSelect>
                </div>
                <Button
                    type="submit"
                    disabled={workload.terms.length === 0}
                >
                    View workload
                </Button>
            </form>
        </section>
    );
}
