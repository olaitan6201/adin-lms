import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { useId } from 'react';
import type { Field as FieldSpec } from './RecordForm';
import { RecordCheckboxes } from './RecordCheckboxes';

export function RecordField({ field, error }: {
    field: FieldSpec;
    error?: string;
}) {
    const id = useId();
    const props = {
        id,
        name: field.name,
        required: !field.optional,
        defaultValue: field.initial,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? `${id}-error` : undefined,
    };

    if (field.multiple && field.options) {
        return <RecordCheckboxes field={field} options={field.options} />;
    }

    return (
        <Field className="min-w-0 [&>[data-slot=native-select-wrapper]]:max-w-full" data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
            {field.options ? (
                <NativeSelect {...props} defaultValue={field.initial ?? ''}>
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
            <FieldError id={`${id}-error`} role={undefined}>
                {error}
            </FieldError>
        </Field>
    );
}
