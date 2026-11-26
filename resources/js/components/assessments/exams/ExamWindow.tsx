import { useState } from 'react';
import { PortalField } from '@/components/forms/PortalForm';

export function ExamWindow({ errors = {} }: { errors?: Record<string, string> }) {
    const [opens, setOpens] = useState('');
    const [closes, setCloses] = useState('');
    const formatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'long' });
    const preview = (value: string) => formatter.format(new Date(`${value}Z`));
    return (
        <fieldset className="grid min-w-0 gap-3">
            <legend className="font-semibold">Examination window</legend>
            <p>Enter both times in UTC (UTC+00:00).</p>
            <PortalField
                label="Opens (UTC)"
                type="datetime-local"
                required
                value={opens}
                onChange={(event) => setOpens(event.target.value)}
                error={errors.opens_at}
            />
            <input type="hidden" name="opens_at" value={opens ? `${opens}Z` : ''} />
            <PortalField
                label="Closes (UTC)"
                type="datetime-local"
                required
                value={closes}
                onChange={(event) => setCloses(event.target.value)}
                error={errors.closes_at}
            />
            <input type="hidden" name="closes_at" value={closes ? `${closes}Z` : ''} />
            <p role="status">
                {opens &&
                closes &&
                Number.isFinite(Date.parse(`${opens}Z`)) &&
                Number.isFinite(Date.parse(`${closes}Z`))
                    ? `On this device (${formatter.resolvedOptions().timeZone}): ${preview(opens)} – ${preview(closes)}.`
                    : 'Enter both times to preview the window in your device time zone.'}
            </p>
        </fieldset>
    );
}
