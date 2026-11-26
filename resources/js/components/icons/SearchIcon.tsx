import { iconProps, type IconProps } from './iconProps';

export function SearchIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.8-3.8" />
        </svg>
    );
}
