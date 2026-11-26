import type { AriaAttributes, MouseEventHandler, ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { Icon } from './Icon';

const tones = new Map([
    ['emerald', 'bg-brand-50 text-brand-700 ring-brand-200'],
    ['slate', 'bg-ink-50 text-ink-600 ring-ink-200'],
    ['amber', 'bg-amber-50 text-amber-700 ring-amber-200'],
    ['rose', 'bg-rose-50 text-rose-700 ring-rose-200'],
    ['sky', 'bg-sky-50 text-sky-700 ring-sky-200'],
]);

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: string }) {
    return <span className={`badge ring-1 ring-inset ${tones.get(tone) ?? tones.get('slate')}`}>{children}</span>;
}

type ActionProps = AriaAttributes & {
    children: ReactNode;
    icon?: string;
    variant?: string;
    size?: string;
    href?: string;
    onClick?: MouseEventHandler<Element>;
    disabled?: boolean;
};

const variants = new Map([
    ['primary', 'btn-primary'], ['outline', 'btn-outline'], ['ghost', 'btn-ghost'],
    ['danger', 'btn-danger'], ['dark', 'btn-dark'],
]);

export function Action({ children, icon, variant = 'outline', size, href, onClick, disabled, ...attributes }: ActionProps) {
    const className = `btn ${variants.get(variant) ?? 'btn-outline'} ${size === 'sm' ? 'btn-sm' : ''}`;
    const content = <>{icon && <Icon name={icon} className="h-4 w-4" />}<span>{children}</span></>;

    return href && !disabled
        ? <Link {...attributes} href={href} onClick={onClick} className={className}>{content}</Link>
        : <button {...attributes} type="button" disabled={disabled} onClick={onClick} className={className}>{content}</button>;
}

type TableProps = {
    columns: string[];
    rows: ReactNode[][];
    empty?: ReactNode;
    caption?: string;
    rowKeys?: readonly (string | number)[];
};

export function Table({ columns, rows, empty = 'No records to display.', caption, rowKeys }: TableProps) {
    return (
        <div className="overflow-x-auto" data-scroll>
            <table className="tbl">
                {caption && <caption className="sr-only">{caption}</caption>}
                <thead><tr>{columns.map((label, index) => <th key={index} scope="col">{label}</th>)}</tr></thead>
                <tbody>
                    {rows.length ? rows.map((cells, index) => (
                        <tr key={rowKeys?.[index] ?? index}>
                            {cells.map((cell, column) => <td key={column}>{cell}</td>)}
                        </tr>
                    )) : (
                        <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-ink-500">{empty}</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
