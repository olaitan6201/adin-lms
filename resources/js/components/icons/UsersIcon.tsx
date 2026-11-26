import { iconProps, type IconProps } from './iconProps';

export function UsersIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
            <circle cx="9" cy="7" r="3.5" />
            <path d="M22 20v-1.5a4 4 0 0 0-3-3.87" />
            <path d="M16.5 3.7a3.5 3.5 0 0 1 0 6.6" />
        </svg>
    );
}
