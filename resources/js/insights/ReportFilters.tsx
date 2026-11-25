import { Link, router } from '@inertiajs/react';
import type { FormEvent } from 'react';

const fields = [
    { name: 'session', label: 'Academic session', empty: 'All sessions' },
    { name: 'term', label: 'Semester', empty: 'All semesters' },
    { name: 'offering', label: 'Course offering', empty: 'All courses' },
] as const;

type Field = (typeof fields)[number]['name'];
export type Filters = Partial<Record<Field, string>>;
type Choice = {
    id: string;
    label: string;
};

export type Options = Record<Field, Choice[]>;

type Props = {
    path: string;
    family?: string;
    filters: Filters;
    options: Options;
};

export function ReportFilters({ path, filters, options, family }: Props) {
    function apply(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const selected: Filters = {};

        for (const { name } of fields) {
            const value = data.get(name);
            if (typeof value === 'string' && value !== '') {
                selected[name] = value;
            }
        }

        router.get(path, { ...selected, ...(family ? { family } : {}) });
    }

    return (
        <details className="border-b border-[var(--portal-line)]">
            <summary className="cursor-pointer py-3 font-semibold">Report filters</summary>
            <form aria-label="Report filters" onSubmit={apply} className="grid gap-4 pb-4 sm:grid-cols-3">
                {fields.map(({ name, label, empty }) => {
                    const selected = filters[name];
                    const choices = options[name];
                    const missing = selected && !choices.some((choice) => choice.id === selected);

                    return (
                        <label key={name} className="grid min-w-0 gap-1 font-medium">
                            {label}
                            <select
                                name={name}
                                defaultValue={selected ?? ''}
                                className="min-h-11 w-full min-w-0 rounded border border-slate-500 bg-white p-2"
                            >
                                <option value="">{empty}</option>
                                {missing && <option value={selected}>No matching records</option>}
                                {choices.map((choice) => (
                                    <option value={choice.id} key={choice.id}>
                                        {choice.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    );
                })}
                <div className="flex flex-wrap items-center gap-4 sm:col-span-3">
                    <button className="portal-action">Apply filters</button>
                    <Link href={family ? `${path}?family=${family}` : path} className="py-2 underline">
                        Clear filters
                    </Link>
                </div>
            </form>
        </details>
    );
}
