import type { ComponentProps } from 'react';

export function AssessmentWorkspace({ children, ...props }: ComponentProps<'main'>) {
    return (
        <main {...props} className="assessment-workspace">
            {children}
        </main>
    );
}
