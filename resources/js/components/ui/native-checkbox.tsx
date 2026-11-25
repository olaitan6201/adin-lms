import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { useFieldFeedback } from './form-feedback';

/** Keep the native checked value, constraint validation and form reset behavior. */
export function NativeCheckbox({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
    const feedback = useFieldFeedback(props.name, props['aria-describedby']);
    return <input {...props} {...feedback} type="checkbox" data-slot="checkbox"
        className={cn('size-4 shrink-0 align-middle accent-primary disabled:opacity-50', className)} />;
}
