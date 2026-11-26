import { iconProps, type IconProps } from './iconProps';

export function HistoryIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
            <path d="M3 4v5h5" />
            <path d="M12 7.5V12l3.5 2" />
        </svg>
    );
}
