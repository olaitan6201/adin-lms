interface FieldProps {
    label: string;
    value?: string | number;
    options?: string[];
    type?: string;
    required?: boolean;
    readOnly?: boolean;
}

function FieldInput({ label, value, options, type = 'text', required, readOnly }: FieldProps) {
    if (options) {
        return (
            <select className="select block w-full" aria-label={label} name={label} defaultValue={value}>
                {options.map((option) => (
                    <option key={option}>{option}</option>
                ))}
            </select>
        );
    }

    if (type === 'textarea') {
        return (
            <textarea className="input block w-full" rows={3} name={label} defaultValue={value} required={required} />
        );
    }

    return (
        <input
            className="input block w-full"
            type={type}
            required={required}
            readOnly={readOnly}
            name={label}
            defaultValue={value}
        />
    );
}

export function Field(props: FieldProps) {
    return (
        <label className="block">
            <span className="label">{props.label}</span>
            <FieldInput {...props} />
        </label>
    );
}
