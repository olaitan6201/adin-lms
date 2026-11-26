import { iconProps, type IconProps } from './iconProps';

export function CompassIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <circle cx="12" cy="12" r="9" />
            <path d="m15.5 8.5-2 5-5 2 2-5z" />
        </svg>
    );
}
