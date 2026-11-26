import { iconProps, type IconProps } from './iconProps';

export function RefreshIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
            <path d="M21 4v5h-5" />
        </svg>
    );
}
