import { iconProps, type IconProps } from './iconProps';

export function MailIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
            />
            <path d="m3.5 6.5 8.5 6 8.5-6" />
        </svg>
    );
}
