import { iconProps, type IconProps } from './iconProps';

export function LockOpenIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 7.5-2" />
        </svg>
    );
}
