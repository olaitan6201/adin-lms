import { iconProps, type IconProps } from './iconProps';

export function MonitorIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <rect x="2.5" y="4" width="19" height="13" rx="2" />
            <path d="M8.5 21h7M12 17v4" />
        </svg>
    );
}
