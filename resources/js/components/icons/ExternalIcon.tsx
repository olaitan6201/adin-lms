import { iconProps, type IconProps } from './iconProps';

export function ExternalIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M14 4h6v6" />
            <path d="M20 4 10.5 13.5" />
            <path d="M19 14.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4.5" />
        </svg>
    );
}
