import { iconProps, type IconProps } from './iconProps';

export function GraduationIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M22 9 12 4.5 2 9l10 4.5z" />
            <path d="M6 11.2V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.8" />
            <path d="M22 9v5.5" />
        </svg>
    );
}
