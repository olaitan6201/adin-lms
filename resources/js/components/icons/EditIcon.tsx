import { iconProps, type IconProps } from './iconProps';

export function EditIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
        </svg>
    );
}
