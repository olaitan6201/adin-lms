import { iconProps, type IconProps } from './iconProps';

export function CalendarCheckIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
            <path d="m9 15 2 2 4-4" />
        </svg>
    );
}
