import { iconProps, type IconProps } from './iconProps';

export function TimerIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2.5 1.8" />
            <path d="M9 2.5h6" />
        </svg>
    );
}
