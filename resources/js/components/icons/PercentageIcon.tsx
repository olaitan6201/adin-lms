import { iconProps, type IconProps } from './iconProps';

export function PercentageIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="m19 5-14 14" />
            <circle cx="7" cy="7" r="2.5" />
            <circle cx="17" cy="17" r="2.5" />
        </svg>
    );
}
