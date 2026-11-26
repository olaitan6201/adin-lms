import { iconProps, type IconProps } from './iconProps';

export function MicIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <rect x="9" y="2.5" width="6" height="11" rx="3" />
            <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
            <path d="M12 18v3.5M8.5 21.5h7" />
        </svg>
    );
}
