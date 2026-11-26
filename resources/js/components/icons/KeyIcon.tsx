import { iconProps, type IconProps } from './iconProps';

export function KeyIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <circle cx="8" cy="15" r="4" />
            <path d="m11 12 9-9 2 2-2 2 2 2-3 3-2-2-2 2" />
        </svg>
    );
}
