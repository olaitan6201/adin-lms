import { iconProps, type IconProps } from './iconProps';

export function SheetIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <rect
                x="3"
                y="3.5"
                width="18"
                height="17"
                rx="2"
            />
            <path d="M3 9h18M3 15h18M9 3.5v17" />
        </svg>
    );
}
