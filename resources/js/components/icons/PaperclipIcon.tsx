import { iconProps, type IconProps } from './iconProps';

export function PaperclipIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8.5-8.5a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3l7.5-7.5" />
        </svg>
    );
}
