import { iconProps, type IconProps } from './iconProps';

export function LifeBuoyIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="3.5" />
            <path d="m5.6 5.6 4.3 4.3M14.1 14.1l4.3 4.3M18.4 5.6l-4.3 4.3M9.9 14.1l-4.3 4.3" />
        </svg>
    );
}
