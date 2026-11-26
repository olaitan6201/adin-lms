import { iconProps, type IconProps } from './iconProps';

export function AwardIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <circle cx="12" cy="9" r="6" />
            <path d="m8.2 14.2-1.4 7 5.2-2.8 5.2 2.8-1.4-7" />
        </svg>
    );
}
