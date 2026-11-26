import { iconProps, type IconProps } from './iconProps';

export function ListIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
        </svg>
    );
}
