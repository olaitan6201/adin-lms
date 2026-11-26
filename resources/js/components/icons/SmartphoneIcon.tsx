import { iconProps, type IconProps } from './iconProps';

export function SmartphoneIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <rect
                x="6.5"
                y="2.5"
                width="11"
                height="19"
                rx="2"
            />
            <path d="M10.5 18.5h3" />
        </svg>
    );
}
