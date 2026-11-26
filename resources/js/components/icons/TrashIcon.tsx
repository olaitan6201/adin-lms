import { iconProps, type IconProps } from './iconProps';

export function TrashIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M4 7h16" />
            <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            <path d="M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" />
            <path d="M10 11v6M14 11v6" />
        </svg>
    );
}
