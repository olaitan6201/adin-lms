import { iconProps, type IconProps } from './iconProps';

export function StackIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M12 3 3 7.5l9 4.5 9-4.5z" />
            <path d="m3 12.5 9 4.5 9-4.5" />
            <path d="m3 17 9 4.5 9-4.5" />
        </svg>
    );
}
