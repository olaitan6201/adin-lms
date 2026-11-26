import { iconProps, type IconProps } from './iconProps';

export function ActivityIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M3 12h4l3 8 4-16 3 8h4" />
        </svg>
    );
}
