import { iconProps, type IconProps } from './iconProps';

export function ChevronDownIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="m5 9 7 7 7-7" />
        </svg>
    );
}
