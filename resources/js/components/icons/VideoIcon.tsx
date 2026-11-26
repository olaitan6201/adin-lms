import { iconProps, type IconProps } from './iconProps';

export function VideoIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <rect
                x="2.5"
                y="6"
                width="13"
                height="12"
                rx="2"
            />
            <path d="m15.5 11 5-3v8l-5-3z" />
        </svg>
    );
}
