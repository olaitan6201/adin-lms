type MarkProps = { source: string; className: string };

/** Decorative crest beside the institution's visible name. */
export function InstitutionMark({ source, className }: MarkProps) {
    if (!source.includes('#')) return <img src={source} className={className} alt="" />;
    return <svg viewBox="0 0 74 63" aria-hidden="true" focusable="false" className={className}>
        <use href={source} />
    </svg>;
}
