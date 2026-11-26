import { iconProps, type IconProps } from './iconProps';

export function WhistleIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M14 8h6l-1.5 4" />
            <path d="M20 10h-4" />
            <circle cx="7" cy="14" r="4.5" />
            <path d="M11 12.5 16 10" />
        </svg>
    );
}
