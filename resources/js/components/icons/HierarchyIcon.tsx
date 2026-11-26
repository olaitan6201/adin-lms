import { iconProps, type IconProps } from './iconProps';

export function HierarchyIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <rect
                x="9"
                y="2.5"
                width="6"
                height="5"
                rx="1.5"
            />
            <rect
                x="2"
                y="16.5"
                width="6"
                height="5"
                rx="1.5"
            />
            <rect
                x="16"
                y="16.5"
                width="6"
                height="5"
                rx="1.5"
            />
            <path d="M12 7.5v3.5M5 16.5V13a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3.5" />
        </svg>
    );
}
