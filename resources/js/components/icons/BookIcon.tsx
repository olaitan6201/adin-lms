import { iconProps, type IconProps } from './iconProps';

export function BookIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4H10a2 2 0 0 1 2 2v13a1.6 1.6 0 0 0-1.6-1.5H4.5A1.5 1.5 0 0 1 3 16z" />
            <path d="M21 5.5A1.5 1.5 0 0 0 19.5 4H14a2 2 0 0 0-2 2v13a1.6 1.6 0 0 1 1.6-1.5h4.9A1.5 1.5 0 0 0 21 16z" />
        </svg>
    );
}
