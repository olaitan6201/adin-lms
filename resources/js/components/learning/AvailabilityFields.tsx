import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { localInput } from './EntryForm';

interface AvailabilityWindow {
    opens_at: string | null;
    closes_at: string | null;
}

export function AvailabilityFields({ item }: { item?: AvailabilityWindow }) {
    return (
        <>
            <Label className="grid gap-2">
                Available from (local time)
                <Input name="opens_at" type="datetime-local" defaultValue={localInput(item?.opens_at)} />
            </Label>
            <Label className="grid gap-2">
                Available until (local time)
                <Input name="closes_at" type="datetime-local" defaultValue={localInput(item?.closes_at)} />
            </Label>
        </>
    );
}
