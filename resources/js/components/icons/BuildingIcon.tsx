import { iconProps, type IconProps } from './iconProps';

export function BuildingIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M5 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17" />
            <path d="M15 9h3a1 1 0 0 1 1 1v11" />
            <path d="M8 7h3M8 11h3M8 15h3M8 19h3" />
            <path d="M3 21h18" />
        </svg>
    );
}
