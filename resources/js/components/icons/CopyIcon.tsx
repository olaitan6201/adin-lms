import { iconProps, type IconProps } from './iconProps';

export function CopyIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
        </svg>
    );
}
