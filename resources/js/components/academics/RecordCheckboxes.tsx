import { useFieldFeedback } from '@/components/forms/FormFeedback';
import type { Choice, Field } from './RecordForm';

export function RecordCheckboxes({ field, options }: { field: Field; options: Choice[] }) {
    const feedback = useFieldFeedback(field.name);

    return (
        <fieldset className="space-y-1 rounded-md border border-border px-3 pb-2" {...feedback}>
            <legend className="px-1 text-sm font-medium">{field.label}</legend>
            {options.map((option) => (
                <label key={option.id} className="flex min-h-10 cursor-pointer items-start gap-2 py-2 text-sm">
                    <input
                        className="mt-0.5 size-4 shrink-0 accent-primary"
                        name={field.name}
                        type="checkbox"
                        value={option.id}
                        {...feedback}
                    />
                    <span className="min-w-0 wrap-anywhere">{option.name}</span>
                </label>
            ))}
        </fieldset>
    );
}
