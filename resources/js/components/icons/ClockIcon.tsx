import { iconProps, type IconProps } from './iconProps';

export function ClockIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5V12l3 1.8" />
        </svg>
    );
}
