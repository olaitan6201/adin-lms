import { iconProps, type IconProps } from './iconProps';

export function AlertIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            <path d="M12 9v4.5M12 17.5h.01" />
        </svg>
    );
}
