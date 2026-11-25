type DeskHeadingProps = {
    area: string;
    title: string;
    children: string;
};

export function DeskHeading({ area, title, children }: DeskHeadingProps) {
    return (
        <header className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{area}</p>
            <h1 className="break-words text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="max-w-prose">{children}</p>
        </header>
    );
}
