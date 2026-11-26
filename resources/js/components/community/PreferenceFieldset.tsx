import type { NotificationPreferences } from '@/types/community/notifications';

type FieldsetProps = {
    category: NotificationPreferences['categories'][number];
    settings: Record<string, boolean>;
    toggle: (id: string, checked: boolean) => void;
};

export function PreferenceFieldset({ category, settings, toggle }: FieldsetProps) {
    const { title, description, digest, channels } = category;
    return (
        <fieldset className="py-4" aria-label={title}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-[13.5px] font-medium text-ink-800">{title}</p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-500">{description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-medium text-ink-600">
                    {digest} digest
                </span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {channels.map(({ label, enabled }) => {
                    const id = `${title}:${label}`;
                    return (
                        <label key={id} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px] text-ink-700">
                            <input
                                type="checkbox"
                                className="size-4"
                                checked={settings[id] ?? enabled}
                                onChange={event => toggle(id, event.target.checked)}
                            />
                            {label}
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}
