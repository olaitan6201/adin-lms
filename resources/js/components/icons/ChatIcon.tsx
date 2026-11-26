import { iconProps, type IconProps } from './iconProps';

export function ChatIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 12z" />
        </svg>
    );
}
