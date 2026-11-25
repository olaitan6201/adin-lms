import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { useId } from 'react';

export function VerifiedRecord({ children, error }: { children: string; error?: string }) {
    const id = useId();
    return (
        <Field orientation="horizontal" data-invalid={error ? true : undefined}>
            <Checkbox
                id={id}
                name="verified"
                value="1"
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
            />
            <FieldContent>
                <FieldLabel htmlFor={id}>{children}</FieldLabel>
                <FieldError id={`${id}-error`} role={undefined}>{error}</FieldError>
            </FieldContent>
        </Field>
    );
}
