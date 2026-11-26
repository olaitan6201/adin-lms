import { iconProps, type IconProps } from './iconProps';

export function PrinterIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M6 9V3h12v6" />
            <path d="M6 18H4a1 1 0 0 1-1-1v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a1 1 0 0 1-1 1h-2" />
            <rect
                x="6"
                y="14"
                width="12"
                height="7"
                rx="1"
            />
        </svg>
    );
}
