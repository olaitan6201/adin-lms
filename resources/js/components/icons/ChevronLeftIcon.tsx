import { iconProps, type IconProps } from './iconProps';

export function ChevronLeftIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="m15 5-7 7 7 7" />
        </svg>
    );
}
