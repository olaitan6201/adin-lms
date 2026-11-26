import { iconProps, type IconProps } from './iconProps';

export function ChartIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M4 20V4" />
            <path d="M4 20h16" />
            <rect x="7.5" y="12" width="3" height="5" rx="1" />
            <rect x="12.5" y="8" width="3" height="9" rx="1" />
            <rect x="17.5" y="5" width="3" height="12" rx="1" />
        </svg>
    );
}
