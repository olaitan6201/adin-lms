import { iconProps, type IconProps } from './iconProps';

export function PieIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M21 12a9 9 0 1 1-9-9v9z" />
            <path d="M15.5 3.7A9 9 0 0 1 20.3 8.5L15.5 9z" />
        </svg>
    );
}
