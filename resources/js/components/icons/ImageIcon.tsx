import { iconProps, type IconProps } from './iconProps';

export function ImageIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="2"
            />
            <circle cx="8.5" cy="9.5" r="1.8" />
            <path d="m4 17 5-5 4 4 3-2.5 4 4" />
        </svg>
    );
}
