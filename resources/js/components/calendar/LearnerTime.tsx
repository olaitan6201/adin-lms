const fields: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'longOffset',
};
const minutes = new Intl.DateTimeFormat(undefined, fields);
const seconds = new Intl.DateTimeFormat(undefined, { ...fields, second: '2-digit' });

export function LearnerTime({ instant, className }: { instant: string; className?: string }) {
    const date = new Date(instant);
    const formatter = date.getSeconds() === 0 ? minutes : seconds;
    return (
        <time dateTime={instant} className={className}>
            {formatter.format(date)}
        </time>
    );
}
