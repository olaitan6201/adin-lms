import { iconProps, type IconProps } from './iconProps';

export function MoreIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <circle cx="5" cy="12" r="1.4" />
            <circle cx="12" cy="12" r="1.4" />
            <circle cx="19" cy="12" r="1.4" />
        </svg>
    );
}
