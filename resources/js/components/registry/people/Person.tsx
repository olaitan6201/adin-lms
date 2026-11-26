type AvatarProps = {
    name: string;
    large?: boolean;
};

export function Avatar({ name, large = false }: AvatarProps) {
    const initials = name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    const colors = [
        'bg-brand-100 text-brand-800',
        'bg-sky-100 text-sky-800',
        'bg-amber-100 text-amber-800',
        'bg-rose-100 text-rose-800',
        'bg-ink-200 text-ink-700',
    ];

    return (
        <span
            aria-hidden
            className={`grid shrink-0 place-items-center rounded-full font-semibold ${large ? 'size-11 text-sm' : 'size-7 text-[10px]'} ${colors[name.length % colors.length]}`}
        >
            {initials}
        </span>
    );
}

type PersonProps = {
    name: string;
    id: string;
};

export function Person({ name, id }: PersonProps) {
    return (
        <div className="flex items-center gap-2.5">
            <Avatar name={name} />
            <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-ink-800">{name}</p>
                <p className="truncate text-[11px] text-ink-400">{id}</p>
            </div>
        </div>
    );
}
