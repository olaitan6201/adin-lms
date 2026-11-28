import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { useId, useState } from 'react';
import type { Field as FieldSpec } from './RecordForm';
import { RecordCheckboxes } from './RecordCheckboxes';

export function RecordField({ field, error }: {
    field: FieldSpec;
    error?: string;
}) {
    const id = useId();
    const [selectedId, setSelectedId] = useState(field.initial);
    const selected = field.showSelectedOption && field.options?.find(option => option.id === selectedId);
    const description = [
        field.description && `${id}-hint`,
        error && `${id}-error`,
        selected && `${id}-selection`,
    ].filter(Boolean).join(' ');
    const props = {
        id,
        name: field.name,
        required: !field.optional,
        defaultValue: field.initial,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': description || undefined,
    };

    if (field.multiple && field.options) {
        return <RecordCheckboxes field={field} options={field.options} />;
    }

    return (
        <Field className="min-w-0 [&>[data-slot=native-select-wrapper]]:max-w-full" data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
            {field.description && (
                <p className="text-sm text-muted-foreground" id={`${id}-hint`}>
                    {field.description}
                </p>
            )}
            {field.options ? (
                <NativeSelect
                    {...props}
                    defaultValue={field.initial ?? ''}
                    onChange={field.showSelectedOption ? event => setSelectedId(event.currentTarget.value) : undefined}
                >
                    <NativeSelectOption value="">Select an option</NativeSelectOption>
                    {field.options.map((option) => (
                        <NativeSelectOption key={option.id} value={option.id}>
                            {option.name}
                        </NativeSelectOption>
                    ))}
                </NativeSelect>
            ) : field.type === 'textarea' ? (
                <Textarea {...props} />
            ) : (
                <Input
                    {...props}
                    type={field.type ?? 'text'}
                    min={field.min}
                    max={field.max}
                    inputMode={field.inputMode}
                />
            )}
            {selected && (
                <p className="wrap-anywhere text-sm text-muted-foreground" id={`${id}-selection`}>
                    {selected.name}
                </p>
            )}
            <FieldError id={`${id}-error`} role={undefined}>
                {error}
            </FieldError>
        </Field>
    );
}
