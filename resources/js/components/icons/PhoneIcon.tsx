import { iconProps, type IconProps } from './iconProps';

export function PhoneIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M6.5 3h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3z" />
        </svg>
    );
}
