import { iconProps, type IconProps } from './iconProps';

export function HourglassIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M7 3h10M7 21h10" />
            <path d="M8 3v3.5c0 2 4 4 4 5.5s-4 3.5-4 5.5V21M16 3v3.5c0 2-4 4-4 5.5s4 3.5 4 5.5V21" />
        </svg>
    );
}
