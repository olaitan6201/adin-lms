import { iconProps, type IconProps } from './iconProps';

export function ArchiveIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <rect x="2.5" y="4" width="19" height="4.5" rx="1.5" />
            <path d="M4.5 8.5V19a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8.5" />
            <path d="M10 12.5h4" />
        </svg>
    );
}
