import { NativeSelectOption } from '@/components/ui/native-select';
import { Disclosure } from './Disclosure';
import { NativeSelect } from '@/components/ui/native-select';
import { Button } from '@/components/ui/button';
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
        <Disclosure label="Report filters">
            <form aria-label="Report filters" onSubmit={apply} className="grid gap-4 pb-4 sm:grid-cols-3">
                {fields.map(({ name, label, empty }) => {
                    const selected = filters[name];
                    const choices = options[name];
                    const missing = selected && !choices.some((choice) => choice.id === selected);

                    return (
                        <label key={name} className="grid min-w-0 gap-1 font-medium [&>div]:w-full [&>div]:min-w-0">
                            {label}
                            <NativeSelect
                                className="w-full min-w-0"
                                name={name}
                                defaultValue={selected ?? ''}
                            >
                                <NativeSelectOption value="">{empty}</NativeSelectOption>
                                {missing && <NativeSelectOption value={selected}>No matching records</NativeSelectOption>}
                                {choices.map((choice) => (
                                    <NativeSelectOption value={choice.id} key={choice.id}>
                                        {choice.label}
                                    </NativeSelectOption>
                                ))}
                            </NativeSelect>
                        </label>
                    );
                })}
                <div className="flex flex-wrap items-center gap-4 sm:col-span-3">
                    <Button>Apply filters</Button>
                    <Link href={family ? `${path}?family=${family}` : path} className="py-2 underline">
                        Clear filters
                    </Link>
                </div>
            </form>
        </Disclosure>
    );
}
