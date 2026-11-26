import { iconProps, type IconProps } from './iconProps';

export function QrIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <rect
                x="3"
                y="3"
                width="7"
                height="7"
                rx="1"
            />
            <rect
                x="14"
                y="3"
                width="7"
                height="7"
                rx="1"
            />
            <rect
                x="3"
                y="14"
                width="7"
                height="7"
                rx="1"
            />
            <path d="M14 14h3v3h-3zM19 19h2M19 14h2M14 19h3" />
        </svg>
    );
}
