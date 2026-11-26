import { iconProps, type IconProps } from './iconProps';

export function BellIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5" />
            <path d="M13.7 20a2 2 0 0 1-3.4 0" />
        </svg>
    );
}
