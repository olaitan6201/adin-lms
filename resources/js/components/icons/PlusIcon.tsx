import { iconProps, type IconProps } from './iconProps';

export function PlusIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M12 5v14M5 12h14" />
        </svg>
    );
}
