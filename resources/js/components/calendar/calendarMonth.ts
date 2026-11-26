function utcDate(iso: string) {
    return new Date(`${iso}T00:00:00Z`);
}

export function monthOffset(today: string, target: string) {
    const anchor = utcDate(today);
    const date = utcDate(target);
    return (date.getUTCFullYear() - anchor.getUTCFullYear()) * 12 + date.getUTCMonth() - anchor.getUTCMonth();
}

export function calendarMonth(today: string, offset: number) {
    const anchor = utcDate(today);
    const year = anchor.getUTCFullYear();
    const month = anchor.getUTCMonth() + offset;
    const first = new Date(Date.UTC(year, month, 1));
    const days = Array.from({ length: 42 }, (_, index) => {
        const date = new Date(Date.UTC(year, month, index - first.getUTCDay() + 1));
        return {
            iso: date.toISOString().slice(0, 10),
            day: date.getUTCDate(),
            inMonth: date.getUTCMonth() === first.getUTCMonth(),
        };
    });

    return {
        title: first.toLocaleString('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
        firstDate: first.toISOString().slice(0, 10),
        days,
    };
}
