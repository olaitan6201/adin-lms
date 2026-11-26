import { iconProps, type IconProps } from './iconProps';

export function CameraIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.7a1 1 0 0 0 .84-.46l.92-1.4A1 1 0 0 1 9.8 3.7h4.4a1 1 0 0 1 .84.46l.92 1.4a1 1 0 0 0 .84.46h1.7A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
            <circle cx="12" cy="12" r="3.5" />
        </svg>
    );
}
