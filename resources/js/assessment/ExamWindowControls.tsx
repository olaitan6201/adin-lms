import { PortalField } from '../components/PortalForm';

export function ExamWindowControls({ errors }: { errors: Record<string, string> }) {
    return (
<>
<PortalField
    label="Opens (server time)"
    name="opens_at"
    type="datetime-local"
    required
    error={errors.opens_at}
/>
<PortalField
    label="Closes (server time)"
    name="closes_at"
    type="datetime-local"
    required
    error={errors.closes_at}
/>
<PortalField
    label="Duration (seconds)"
    name="duration_seconds"
    type="number"
    min={1}
    max={86400}
    required
    defaultValue="3600"
    error={errors.duration_seconds}
/>
<PortalField
    label="Attempt limit"
    name="max_attempts"
    type="number"
    min={1}
    max={100}
    required
    defaultValue="1"
    error={errors.max_attempts}
/>
<label className="flex items-center gap-2">
    <input name="shuffle" type="checkbox" value="1" />
    Shuffle choices and matching options
</label>
</>
    );
}
