import { Button } from '@/components/ui/button';
import { FormFeedback } from '@/components/forms/FormFeedback';
import { Form } from '@inertiajs/react';
import type { ReactNode } from 'react';

interface PostProps {
    url: string;
    button: string;
    children?: ReactNode;
}

export function Post({ url, button, children }: PostProps) {
    return (
        <Form
            action={url}
            method="post"
            className="grid min-w-0 gap-4 py-2 [&_button:not([role])]:h-auto [&_button:not([role])]:min-h-9 [&_button:not([role])]:max-w-full [&_button:not([role])]:w-fit [&_button:not([role])]:whitespace-normal"
        >
            {({ processing, errors, recentlySuccessful }) => (
                <FormFeedback errors={errors}>
                    {children}
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving…' : button}
                    </Button>
                    <p aria-live="polite">{recentlySuccessful ? 'Saved.' : ''}</p>
                </FormFeedback>
            )}
        </Form>
    );
}
