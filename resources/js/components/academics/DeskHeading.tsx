type DeskHeadingProps = {
    area: string;
    title: string;
    children: string;
};

export function DeskHeading({ area, title, children }: DeskHeadingProps) {
    return (
        <header className="desk-heading">
            <p className="portal-kicker">{area}</p>
            <h1 className="portal-title">{title}</h1>
            <p className="max-w-prose">{children}</p>
        </header>
    );
}
