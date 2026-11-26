type Step = {
    title: string;
    detail: string;
};

function FlowStep({ x, textY, step }: {
    x: number;
    textY: number;
    step: Step;
}) {
    return (
        <g transform={`translate(${x} 0)`}>
            <rect x="0" y="45" width="104" height="60" rx="10" fill="#ffffff" stroke="#D5DDE6" />
            <text x="52" y={textY} textAnchor="middle" fontSize="12" fontWeight="600" fill="#22344C">
                {step.title}
            </text>
            <text x="52" y={textY + 18} textAnchor="middle" fontSize="10" fill="#7A8CA0">{step.detail}</text>
            <path d="M110 75h44" stroke="#AEBCCB" strokeWidth="1.6" />
            <path d="m154 75-7-4v8z" fill="#AEBCCB" />
        </g>
    );
}

export function PostingFlow({ steps, result }: {
    steps: readonly [Step, Step, Step];
    result: string;
}) {
    return (
        <svg viewBox="0 0 520 150" className="h-auto w-full" role="img"
            aria-label={[...steps.map(step => `${step.title}: ${step.detail}`), result].join(' → ')}>
            {steps.map((step, i) => <FlowStep key={step.title} x={6 + 160 * i} textY={i === 0 ? 72 : 70} step={step} />)}
            <rect x="420" y="115" width="94" height="30" rx="8" fill="#ECFDF5" stroke="#A7F3D0" />
            <text x="467" y="134" textAnchor="middle" fontSize="11" fontWeight="600" fill="#047857">{result}</text>
            <path d="M378 105v10h42" stroke="#A7F3D0" strokeWidth="1.6" fill="none" />
        </svg>
    );
}
