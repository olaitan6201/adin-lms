import { useFieldFeedback } from '@/components/forms/FormFeedback';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import type { ComponentProps } from 'react';

/** Associate server validation messages with the corresponding submitted field. */
export function ValidatedInput(props: ComponentProps<typeof Input>) {
    const feedback = useFieldFeedback(props.name, props['aria-describedby']);
    return <Input {...props} {...feedback} />;
}

export function ValidatedSelect(props: ComponentProps<typeof NativeSelect>) {
    const feedback = useFieldFeedback(props.name, props['aria-describedby']);
    return <NativeSelect {...props} {...feedback} />;
}

export function ValidatedTextarea(props: ComponentProps<typeof Textarea>) {
    const feedback = useFieldFeedback(props.name, props['aria-describedby']);
    return <Textarea {...props} {...feedback} />;
}
