import { iconProps, type IconProps } from './iconProps';

export function GlobeIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18" />
            <path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" />
        </svg>
    );
}
