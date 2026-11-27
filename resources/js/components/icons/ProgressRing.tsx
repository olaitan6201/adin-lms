/** The owning panel supplies the accessible name and visible percentage. */
export function ProgressRing({ percent }: { percent: number }) {
    const radius = 43.5;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <svg
            viewBox="0 0 96 96"
            className="size-full -rotate-90"
            aria-hidden="true"
            focusable="false"
        >
            <circle
                cx="48"
                cy="48"
                r={radius}
                fill="none"
                stroke="#E7ECF1"
                strokeWidth="9"
            />
            <circle
                cx="48"
                cy="48"
                r={radius}
                fill="none"
                stroke="#10B981"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
            />
        </svg>
    );
}
