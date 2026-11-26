import { iconProps, type IconProps } from './iconProps';

export function MegaphoneIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="m3 11 14-6v14L3 13z" />
            <path d="M3 11H2.5A1.5 1.5 0 0 0 1 12.5v0A1.5 1.5 0 0 0 2.5 14H3" />
            <path d="M7 13.5V19a1.5 1.5 0 0 0 3 0v-4" />
        </svg>
    );
}
