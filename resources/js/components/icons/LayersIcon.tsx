import { iconProps, type IconProps } from './iconProps';

export function LayersIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M12 3 2.8 7.4a1 1 0 0 0 0 1.8L12 13.6l9.2-4.4a1 1 0 0 0 0-1.8z" />
            <path d="m2.8 12.2 9.2 4.4 9.2-4.4" />
            <path d="m2.8 16.8 9.2 4.4 9.2-4.4" />
        </svg>
    );
}
