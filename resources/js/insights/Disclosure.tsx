import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function Disclosure({ label, children }: { label: string; children: ReactNode }) {
    return <Collapsible>
        <CollapsibleTrigger asChild>
            <Button variant="outline">{label}</Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">{children}</CollapsibleContent>
    </Collapsible>;
}
