import { iconProps, type IconProps } from './iconProps';

export function SettingsIcon(props: IconProps) {
    return (
        <svg {...iconProps(props)}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 14.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-2.87 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.95-1.1l-.06.07a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 14.5H4.5a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.1-2.95l-.07-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 11 4.6V4.5a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.95 1.1l.06-.07a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 10.5h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-.5.5z" />
        </svg>
    );
}
