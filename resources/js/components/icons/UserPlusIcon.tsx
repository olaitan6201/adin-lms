import { iconProps, type IconProps } from './iconProps';

export function UserPlusIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M15 20.5v-1.8a6.2 6.2 0 0 0-12.4 0v1.8" />
            <circle cx="8.8" cy="7.5" r="4" />
            <path d="M19 8v6M22 11h-6" />
        </svg>
    );
}
