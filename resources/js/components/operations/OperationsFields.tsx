import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { useId, useLayoutEffect, useRef, type ComponentProps } from 'react';
import { PortalField } from '@/components/forms/PortalForm';

export function OperationsInput(props: ComponentProps<typeof PortalField>) {
    return <PortalField {...props} announceError={false} />;
}

export function OperationsSelect({ label, error, children, ...select }: ComponentProps<typeof NativeSelect> & {
    label: string;
    error?: string;
}) {
    const id = useId();
    return (
        <div>
            <Label htmlFor={id}>{label}</Label>
            <NativeSelect
                {...select}
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
            >
                {children}
            </NativeSelect>
            {error && <p className="mt-1 text-sm text-destructive" id={`${id}-error`}>{error}</p>}
        </div>
    );
}

export function CorrectionFocus({ errors }: { errors: Record<string, unknown> }) {
    const marker = useRef<HTMLSpanElement>(null);
    useLayoutEffect(() => {
        if (Object.keys(errors).length) {
            marker.current?.closest('form')?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        }
    }, [errors]);
    return <span ref={marker} hidden />;
}
