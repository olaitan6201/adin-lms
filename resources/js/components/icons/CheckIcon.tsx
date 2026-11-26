import { iconProps, type IconProps } from './iconProps';

export function CheckIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="m4.5 12.5 5 5 10-11" />
        </svg>
    );
}
