import { iconProps, type IconProps } from './iconProps';

export function CodeIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="m9 8-5 4 5 4" />
            <path d="m15 8 5 4-5 4" />
        </svg>
    );
}
