import { iconProps, type IconProps } from './iconProps';

export function SpinnerIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M12 3a9 9 0 1 0 9 9" />
        </svg>
    );
}
