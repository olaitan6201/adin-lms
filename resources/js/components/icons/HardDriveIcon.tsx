import { iconProps, type IconProps } from './iconProps';

export function HardDriveIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M3 12h18" />
            <path d="M5.5 5h13l2.5 7v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" />
            <path d="M6.5 16.5h.01M10 16.5h.01" />
        </svg>
    );
}
