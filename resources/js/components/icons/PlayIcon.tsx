import { iconProps, type IconProps } from './iconProps';

export function PlayIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <circle cx="12" cy="12" r="9" />
            <path d="m10 8.5 6 3.5-6 3.5z" />
        </svg>
    );
}
