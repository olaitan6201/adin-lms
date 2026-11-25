import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useId, type ComponentProps } from 'react';

type FieldProps = Omit<ComponentProps<'input'>, 'id'> & {
    label: string;
    error?: string;
    announceError?: boolean;
};

export function PortalField({ label, error, announceError = true, 'aria-describedby': hint, ...input }: FieldProps) {
    const id = useId();
    const errorId = `${id}-error`;
    const description = [hint, error && errorId].filter(Boolean).join(' ') || undefined;

    return (
        <div>
            <label htmlFor={id}>{label}</label>
            <Input
                {...input}
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={description}
            />
            {error && (
                <p className="mt-1 text-sm text-destructive" id={errorId} role={announceError ? 'alert' : undefined}>
                    {error}
                </p>
            )}
        </div>
    );
}

type SubmitButtonProps = {
    children: string;
    processing: boolean;
};

export function SubmitButton({ children, processing }: SubmitButtonProps) {
    return (
        <Button type="submit" disabled={processing}>
            {children}
        </Button>
    );
}
