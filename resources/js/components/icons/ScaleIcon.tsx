import { iconProps, type IconProps } from './iconProps';

export function ScaleIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M12 3v18M7 21h10" />
            <path d="m5 7 3-4 3 4a3 3 0 0 1-6 0zM13 7l3-4 3 4a3 3 0 0 1-6 0z" />
        </svg>
    );
}
