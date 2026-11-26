import type { ReactElement, ReactNode } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

type DrawerProps = {
    title: string;
    description?: string;
    trigger?: ReactElement;
    children: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function Drawer({ title, description, trigger, open, onOpenChange, children }: DrawerProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
            <SheetContent
                className="w-full gap-0 bg-white sm:max-w-lg"
                {...(!description && { 'aria-describedby': undefined })}
            >
                <SheetHeader className="border-b border-ink-100 p-5 pr-12">
                    <SheetTitle>{title}</SheetTitle>
                    {description && <SheetDescription>{description}</SheetDescription>}
                </SheetHeader>
                <div className="min-h-0 overflow-y-auto p-5" data-scroll>
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    );
}
