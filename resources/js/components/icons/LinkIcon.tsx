import { iconProps, type IconProps } from './iconProps';

export function LinkIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M10 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.7 1.7" />
            <path d="M14 10.5a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.7-1.7" />
        </svg>
    );
}
