import type { ComponentPropsWithRef } from 'react';

export type IconProps = Omit<ComponentPropsWithRef<'svg'>, 'children' | 'dangerouslySetInnerHTML'>;

export function iconProps(props: IconProps): IconProps {
    const labelled = Boolean(props['aria-label'] || props['aria-labelledby']);

    return {
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.75,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        focusable: false,
        className: 'h-5 w-5',
        'aria-hidden': labelled ? undefined : true,
        role: labelled ? 'img' : undefined,
        ...props,
    };
}
