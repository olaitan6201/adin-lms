import { useEffect, useState } from 'react';

export function useLocalToday() {
    const [today, setToday] = useState(() => new Date());

    useEffect(() => {
        const nextDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        const timeout = window.setTimeout(() => setToday(new Date()), nextDay.getTime() - Date.now());

        return () => window.clearTimeout(timeout);
    }, [today]);

    return today;
}
