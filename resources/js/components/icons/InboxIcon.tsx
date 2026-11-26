import { iconProps, type IconProps } from './iconProps';

export function InboxIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M3 12h5l2 3h4l2-3h5" />
            <path d="M4.5 5.5 3 12v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6l-1.5-6.5A2 2 0 0 0 17.6 4H6.4a2 2 0 0 0-1.9 1.5z" />
        </svg>
    );
}
