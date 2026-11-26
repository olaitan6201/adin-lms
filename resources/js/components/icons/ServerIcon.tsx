import { iconProps, type IconProps } from './iconProps';

export function ServerIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <rect
                x="3"
                y="4"
                width="18"
                height="7"
                rx="2"
            />
            <rect
                x="3"
                y="13"
                width="18"
                height="7"
                rx="2"
            />
            <path d="M7 7.5h.01M7 16.5h.01" />
        </svg>
    );
}
