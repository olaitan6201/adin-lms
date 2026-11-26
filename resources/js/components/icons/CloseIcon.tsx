import { iconProps, type IconProps } from './iconProps';

export function CloseIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M6 6l12 12M18 6 6 18" />
        </svg>
    );
}
