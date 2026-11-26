import { iconProps, type IconProps } from './iconProps';

export function MessageIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M21 14a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}
