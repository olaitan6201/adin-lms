/** The owning panel supplies the accessible name and visible percentage. */
export function ProgressRing({ percent }: { percent: number }) {
    return (
        <svg viewBox="0 0 96 96" className="size-full -rotate-90" aria-hidden="true" focusable="false">
            <g fill="none" strokeWidth="9">
                <circle cx="48" cy="48" r="43.5" stroke="#E7ECF1" />
                <circle cx="48" cy="48" r="43.5" stroke="#10B981" strokeLinecap="round"
                    pathLength="100" strokeDasharray="100" strokeDashoffset={100 - percent} />
            </g>
        </svg>
    );
}
