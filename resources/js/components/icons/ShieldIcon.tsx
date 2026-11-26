import { iconProps, type IconProps } from './iconProps';

export function ShieldIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M12 22s8-4 8-10V5.5l-8-3.5-8 3.5V12c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
