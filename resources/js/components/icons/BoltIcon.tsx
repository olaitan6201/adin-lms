import { iconProps, type IconProps } from './iconProps';

export function BoltIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M11 3 6 13h5l-1 8 5-10h-5z" />
        </svg>
    );
}
