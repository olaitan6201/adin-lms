import { iconProps, type IconProps } from './iconProps';

export function DownloadIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="m7.5 11.5 4.5 4.5 4.5-4.5" />
            <path d="M12 16V4" />
        </svg>
    );
}
