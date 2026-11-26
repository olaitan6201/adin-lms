import type { CrestSource } from '@/types/navigation/shell';

type MarkProps = { source: CrestSource; className: string };

/** Decorative crest beside the institution's visible name. */
export function InstitutionMark({ source, className }: MarkProps) {
    if (source.kind === 'image') return <img src={source.src} className={className} alt="" />;
    return <svg viewBox="0 0 74 63" aria-hidden="true" focusable="false" className={className}>
        <use href={source.href} />
    </svg>;
}
