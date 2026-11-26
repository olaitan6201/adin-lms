type RingProps = {
    value: number;
    label: string;
    sublabel?: string;
    size?: number;
    tone?: string;
};

export function Ring({ value, label, sublabel, size = 104, tone }: RingProps) {
    const percent = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
    const color = tone === 'amber' ? 'stroke-amber-500' : tone === 'sky' ? 'stroke-blue-500' : 'stroke-brand-500';

    return (
        <div
            className="relative inline-flex shrink-0"
            style={{ width: size, height: size }}
            role="img"
            aria-label={`${label}: ${percent}%`}
        >
            <svg viewBox="0 0 104 104" className="h-full w-full -rotate-90" aria-hidden="true">
                <circle
                    cx="52"
                    cy="52"
                    r="47.5"
                    fill="none"
                    className="stroke-ink-100"
                    strokeWidth="9"
                />
                <circle
                    cx="52"
                    cy="52"
                    r="47.5"
                    fill="none"
                    className={color}
                    strokeWidth="9"
                    strokeLinecap={percent === 0 ? 'butt' : 'round'}
                    pathLength="100"
                    strokeDasharray="100"
                    strokeDashoffset={100 - percent}
                />
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="tnum text-lg font-semibold text-ink-900">{percent}%</span>
                {sublabel && (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-ink-500">{sublabel}</span>
                )}
            </span>
        </div>
    );
}
