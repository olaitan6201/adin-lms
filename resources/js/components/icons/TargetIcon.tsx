import { iconProps, type IconProps } from './iconProps';

export function TargetIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" r="1.4" />
        </svg>
    );
}
