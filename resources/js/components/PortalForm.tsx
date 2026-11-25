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
            <input
                {...input}
                id={id}
                className="block w-full border p-2"
                aria-invalid={error ? true : undefined}
                aria-describedby={description}
            />
            {error && (
                <p id={errorId} role={announceError ? 'alert' : undefined}>
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
        <button type="submit" className="bg-teal-900 p-2 text-white" disabled={processing}>
            {children}
        </button>
    );
}
