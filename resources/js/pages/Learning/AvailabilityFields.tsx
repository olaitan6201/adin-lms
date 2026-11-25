import { localInput } from './EntryForm';

interface AvailabilityWindow {
    opens_at: string | null;
    closes_at: string | null;
}

export function AvailabilityFields({ item }: { item?: AvailabilityWindow }) {
    return (
        <>
            <label>
                Available from (local time)
                <input
                    name="opens_at"
                    type="datetime-local"
                    defaultValue={localInput(item?.opens_at)}
                />
            </label>
            <label>
                Available until (local time)
                <input
                    name="closes_at"
                    type="datetime-local"
                    defaultValue={localInput(item?.closes_at)}
                />
            </label>
        </>
    );
}
