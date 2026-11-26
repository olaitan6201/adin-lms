import { iconProps, type IconProps } from './iconProps';

export function MenuIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
    );
}
