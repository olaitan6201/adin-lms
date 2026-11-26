import { NativeSelectOption } from '@/components/ui/native-select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Button } from '@/components/ui/button';

export type BankFilterProps = {
    base: string;
    filters: {
        q?: string;
        kind?: string;
        topic?: string;
    };
    topics: string[];
    kinds: string[];
};
export function BankFilters({ base, filters, topics, kinds }: BankFilterProps) {
    return (
        <form action={base} method="get" className="grid gap-3 rounded border p-4 sm:grid-cols-3">
            <Label className="grid min-w-0 gap-2 leading-normal">
                Search prompts
                <Input name="q" defaultValue={filters.q} />
            </Label>
            <Label className="grid min-w-0 gap-2 leading-normal">
                Type
                <NativeSelect name="kind" defaultValue={filters.kind ?? ''}>
                    <NativeSelectOption value="">All types</NativeSelectOption>
                    {kinds.map((kind) => (
                        <NativeSelectOption key={kind} value={kind}>
                            {kind}
                        </NativeSelectOption>
                    ))}
                </NativeSelect>
            </Label>
            <Label className="grid min-w-0 gap-2 leading-normal">
                Topic
                <NativeSelect name="topic" defaultValue={filters.topic ?? ''}>
                    <NativeSelectOption value="">All topics</NativeSelectOption>
                    {topics.map((topic) => (
                        <NativeSelectOption key={topic} value={topic}>
                            {topic}
                        </NativeSelectOption>
                    ))}
                </NativeSelect>
            </Label>
            <Button type="submit" className="justify-self-start">
                Filter questions
            </Button>
        </form>
    );
}
