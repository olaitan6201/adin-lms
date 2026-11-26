import { iconProps, type IconProps } from './iconProps';

export function HelpIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.3-2.5 4" />
            <path d="M12 17.5h.01" />
        </svg>
    );
}
