import { iconProps, type IconProps } from './iconProps';

export function ChevronRightIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="m9 5 7 7-7 7" />
        </svg>
    );
}
