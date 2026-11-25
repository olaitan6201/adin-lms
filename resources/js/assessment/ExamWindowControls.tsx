import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ExamWindow } from './ExamWindow';
import { PortalField } from '../components/PortalForm';

export function ExamWindowControls({ errors }: { errors: Record<string, string> }) {
    return (
        <>
            <ExamWindow errors={errors} />
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
            <Label className="flex items-center gap-2">
                <Checkbox name="shuffle" value="1" />
                Shuffle choices and matching options
            </Label>
        </>
    );
}
