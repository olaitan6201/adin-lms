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
    const arcs = [];
    let offset = 0;
    for (const segment of segments) {
        if (segment.value > 0) {
            arcs.push({ ...segment, start: offset });
            offset += segment.value;
        }
    }

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="size-full" role="img" aria-label={label}>
            <g fill="none" strokeWidth={strokeWidth}>
                <circle cx={center} cy={center} r={radius} stroke="#E7ECF1" />
                {arcs.map(({ label, value, color, start }) => (
                    <circle
                        key={label}
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={color}
                        transform={`rotate(-90 ${center} ${center})`}
                        pathLength={total}
                        strokeDasharray={`${value} ${total - value}`}
                        strokeDashoffset={-start}
                    >
                        <title>{`${label}: ${value}`}</title>
                    </circle>
                ))}
            </g>
        </svg>
    );
}
