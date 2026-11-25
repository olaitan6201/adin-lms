import { Link, router } from '@inertiajs/react';
import type { FormEvent } from 'react';

const fields = [
    { name: 'session', label: 'Academic session', empty: 'All sessions' },
    { name: 'term', label: 'Semester', empty: 'All semesters' },
    { name: 'offering', label: 'Course offering', empty: 'All courses' },
] as const;

type Field = typeof fields[number]['name'];
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
        <form onSubmit={apply} className="flex flex-wrap items-end gap-4 rounded border border-slate-300 p-4">
            {fields.map(({ name, label, empty }) => {
                const selected = filters[name];
                const choices = options[name];
                const missing = selected && !choices.some(choice => choice.id === selected);

                return (
                    <label key={name} className="grid min-w-0 gap-1 font-medium">
                        {label}
                        <select name={name} defaultValue={selected ?? ''} className="max-w-full rounded border border-slate-500 bg-white p-2">
                            <option value="">{empty}</option>
                            {missing && <option value={selected}>No matching records</option>}
                            {choices.map(choice => (
                                <option value={choice.id} key={choice.id}>{choice.label}</option>
                            ))}
                        </select>
                    </label>
                );
            })}
            <button className="rounded bg-teal-800 px-4 py-2 text-white">Apply filters</button>
            <Link href={family ? `${path}?family=${family}` : path} className="py-2 underline">Clear filters</Link>
        </form>
    );
}
