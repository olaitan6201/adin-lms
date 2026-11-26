import { iconProps, type IconProps } from './iconProps';

export function FlagIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M4.5 21V4" />
            <path d="M4.5 4.5h11l-1.5 4 1.5 4h-11" />
        </svg>
    );
}
