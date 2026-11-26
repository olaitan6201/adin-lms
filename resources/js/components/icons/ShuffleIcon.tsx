import { iconProps, type IconProps } from './iconProps';

export function ShuffleIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M17 3.5 21 7l-4 3.5" />
            <path d="M17 13.5 21 17l-4 3.5" />
            <path d="M3 7h3.5c4 0 5.5 10 9.5 10H21" />
            <path d="M3 17h3.5c1.6 0 2.8-1.5 4-3.4M14 8.6C15.2 6.8 16 7 17.5 7H21" />
        </svg>
    );
}
