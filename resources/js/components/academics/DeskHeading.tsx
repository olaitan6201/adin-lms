type DeskHeadingProps = {
    area: string;
    title: string;
    children?: React.ReactNode;
};

export function DeskHeading({ area, title, children }: DeskHeadingProps) {
    return (
        <header className="mb-6 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">{area}</p>
            <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[26px]">{title}</h1>
            {children && <div className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-ink-500">{children}</div>}
        </header>
    );
}
