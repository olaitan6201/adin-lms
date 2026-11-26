import { iconProps, type IconProps } from './iconProps';

export function LibraryIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M4 20V6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v14" />
            <path d="M8 20V6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v14" />
            <path d="M12 20V7a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v13" />
            <path d="M3 20h18" />
        </svg>
    );
}
