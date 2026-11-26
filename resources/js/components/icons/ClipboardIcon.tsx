import { iconProps, type IconProps } from './iconProps';

export function ClipboardIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <rect
                x="8"
                y="2.5"
                width="8"
                height="4"
                rx="1.2"
            />
            <path d="M16 4.5h2a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2h2" />
            <path d="m9 13.5 2 2 4-4.5" />
        </svg>
    );
}
