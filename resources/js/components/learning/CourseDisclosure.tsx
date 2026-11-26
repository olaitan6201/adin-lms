import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronsUpDown } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
    label: string;
    children: ReactNode;
    defaultOpen?: boolean;
    className?: string;
};

export function CourseDisclosure({ label, children, defaultOpen, className }: Props) {
    return (
        <Collapsible defaultOpen={defaultOpen} className={className}>
            <CollapsibleTrigger asChild>
                <Button type="button" variant="outline" className="h-auto max-w-full whitespace-normal text-start">
                    <span className="min-w-0 wrap-anywhere">{label}</span>
                    <ChevronsUpDown aria-hidden="true" />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent forceMount className="data-[state=closed]:hidden">
                {children}
            </CollapsibleContent>
        </Collapsible>
    );
}
