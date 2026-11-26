import { iconProps, type IconProps } from './iconProps';

export function GitIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <circle cx="6" cy="6" r="2.5" />
            <circle cx="6" cy="18" r="2.5" />
            <circle cx="18" cy="8" r="2.5" />
            <path d="M6 8.5v7" />
            <path d="M18 10.5c0 4-5 4-8 4" />
        </svg>
    );
}
