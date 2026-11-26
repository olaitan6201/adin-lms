import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function Disclosure({ label, children }: {
    label: string;
    children: ReactNode
}) {
    return (
        <Collapsible>
            <CollapsibleTrigger asChild>
                <Button variant="outline" className="group">
                    {label}
                    <ChevronDown aria-hidden="true" size={14} className="group-data-[state=open]:rotate-180" />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">{children}</CollapsibleContent>
        </Collapsible>
    );
}
