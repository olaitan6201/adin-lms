import type { WorkloadData } from './contracts';

export function TermSelector({ workload }: { workload: Pick<WorkloadData, 'terms' | 'selected_term'> }) {
    return (
        <section aria-labelledby="term-heading" className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
            <h2 id="term-heading" className="font-semibold text-slate-950">
                Select a term
            </h2>
            <form action="/workload" method="get" className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                    <label htmlFor="term" className="text-sm font-medium text-slate-700">
                        Academic term
                    </label>
                    <select
                        id="term"
                        name="term"
                        defaultValue={workload.selected_term ?? ''}
                        disabled={workload.terms.length === 0}
                        className="mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 disabled:bg-slate-100"
                    >
                        {workload.terms.length === 0 && <option value="">No allocated terms</option>}
                        {workload.terms.map((term) => (
                            <option key={term.id} value={term.id}>
                                {term.label}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={workload.terms.length === 0}
                    className="min-h-11 rounded-md bg-teal-900 px-5 font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    View workload
                </button>
            </form>
        </section>
    );
}
