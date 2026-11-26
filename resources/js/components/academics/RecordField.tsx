import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { useId } from 'react';
import type { Field as FieldSpec } from './RecordForm';

export function RecordField({ field, error }: { field: FieldSpec; error?: string }) {
    const id = useId();
    const props = {
        id,
        name: field.name,
        required: !field.optional,
        defaultValue: field.initial,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? `${id}-error` : undefined,
    };

    return (
        <Field data-invalid={error ? true : undefined}>
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
            ) : (
                <Input {...props} type={field.type ?? 'text'} />
            )}
            <FieldError id={`${id}-error`} role={undefined}>
                {error}
            </FieldError>
        </Field>
    );
}
