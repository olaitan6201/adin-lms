const scale = 100000000n;

export function selectionTotal(values: string[]): string | null {
    let sum = 0n;
    for (const value of values) {
        if (!/^(?:\d+(?:\.\d{0,8})?|\.\d{1,8})$/.test(value)) return null;
        const [whole, fraction = ''] = value.split('.');
        const units = BigInt(whole || '0') * scale + BigInt(fraction.padEnd(8, '0'));
        if (units <= 0n || units > 1000000n * scale) return null;
        sum += units;
    }
    const fraction = String(sum % scale).padStart(8, '0').replace(/0+$/, '');
    return `${sum / scale}${fraction ? `.${fraction}` : ''}`;
}
