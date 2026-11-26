type RingProps = {
    size: number;
    strokeWidth: number;
    label: string;
    segments: readonly { label: string; value: number; color: string }[];
};

export function SegmentedRing({ size, strokeWidth, label, segments }: RingProps) {
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);
    let offset = 0;

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="size-full" role="img" aria-label={label}>
            <g fill="none" strokeWidth={strokeWidth}>
                <circle cx={center} cy={center} r={radius} stroke="#E7ECF1" />
                {segments.filter(segment => segment.value > 0).map(segment => {
                    const start = offset;
                    offset += segment.value;
                    return (
                        <circle key={segment.label} cx={center} cy={center} r={radius} stroke={segment.color}
                            transform={`rotate(-90 ${center} ${center})`} pathLength={total}
                            strokeDasharray={`${segment.value} ${total - segment.value}`} strokeDashoffset={-start}>
                            <title>{`${segment.label}: ${segment.value}`}</title>
                        </circle>
                    );
                })}
            </g>
        </svg>
    );
}
