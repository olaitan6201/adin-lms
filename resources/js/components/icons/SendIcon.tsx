import { iconProps, type IconProps } from './iconProps';

export function SendIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M21 3 10.5 13.5" />
            <path d="M21 3 14.5 21l-4-8-8-4z" />
        </svg>
    );
}
