import { iconProps, type IconProps } from './iconProps';

export function ZapIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z" />
        </svg>
    );
}
