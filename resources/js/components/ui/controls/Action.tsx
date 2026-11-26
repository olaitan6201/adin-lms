import type { AriaAttributes, MouseEventHandler, ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { Icon } from '@/components/icons/Icon';

type Behavior = {
    href?: string;
    onClick?: MouseEventHandler<Element>;
    disabled?: boolean;
} & (
    | { href: string }
    | { onClick: MouseEventHandler<Element> }
    | { disabled: true }
    | { href: string | undefined; disabled: boolean }
);

type ActionProps = AriaAttributes & Behavior & {
    children: ReactNode;
    icon?: string;
    variant?: string;
    size?: string;
};

const variants = new Map([
    ['primary', 'btn-primary'],
    ['outline', 'btn-outline'],
    ['ghost', 'btn-ghost'],
    ['danger', 'btn-danger'],
    ['dark', 'btn-dark'],
]);

export function Action({
    children,
    icon,
    variant = 'outline',
    size,
    href,
    onClick,
    disabled,
    ...attributes
}: ActionProps) {
    const className = `btn ${variants.get(variant) ?? 'btn-outline'} ${size === 'sm' ? 'btn-sm' : ''}`;
    const content = (
        <>
            {icon && <Icon name={icon} className="h-4 w-4" />}
            <span>{children}</span>
        </>
    );

    return href && !disabled ? (
        <Link
            {...attributes}
            href={href}
            onClick={onClick}
            className={className}
        >
            {content}
        </Link>
    ) : (
        <button
            {...attributes}
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={className}
        >
            {content}
        </button>
    );
}
