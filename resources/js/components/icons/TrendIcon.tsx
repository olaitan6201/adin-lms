import { iconProps, type IconProps } from './iconProps';

export function TrendIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="m3 16 5.5-5.5 3.5 3.5L21 5" />
            <path d="M15 5h6v6" />
        </svg>
    );
}
