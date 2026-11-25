import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** Use showModal() and close() on the ref for native focus trapping and Escape. */
export function NativeDialog({ className, ...props }: ComponentProps<'dialog'>) {
    return (
        <dialog data-slot="dialog" className={cn(
            'm-auto max-h-[90dvh] max-w-[min(32rem,calc(100%-2rem))] overflow-y-auto rounded-sm bg-background p-5 text-foreground backdrop:bg-black/50',
            className,
        )} {...props} />
    );
}
