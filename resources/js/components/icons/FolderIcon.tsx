import { iconProps, type IconProps } from './iconProps';

export function FolderIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
    );
}
