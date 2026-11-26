import { iconProps, type IconProps } from './iconProps';

export function CpuIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <rect x="6" y="6" width="12" height="12" rx="2" />
            <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
            <path d="M9 2.5v3M15 2.5v3M9 18.5v3M15 18.5v3M2.5 9h3M2.5 15h3M18.5 9h3M18.5 15h3" />
        </svg>
    );
}
