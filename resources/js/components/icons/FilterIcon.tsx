import { iconProps, type IconProps } from './iconProps';

export function FilterIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M4 5h16l-6.5 7.5V19l-3 1.5v-8z" />
        </svg>
    );
}
