import { iconProps, type IconProps } from './iconProps';

export function BookmarkIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4-7 4V4.5a1 1 0 0 1 1-1z" />
        </svg>
    );
}
