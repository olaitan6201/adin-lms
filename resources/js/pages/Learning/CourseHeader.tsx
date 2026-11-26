import type { ReactNode } from 'react';
import './course-workspace.css';

type Props = {
    eyebrow: string;
    title: string;
    description?: ReactNode;
    actions?: ReactNode;
};

export function CourseHeader({ eyebrow, title, description, actions }: Props) {
    return (
        <header className="course-header">
            <div className="min-w-0 max-w-3xl">
                <p className="course-eyebrow">{eyebrow}</p>
                <h1>{title}</h1>
                {description}
            </div>
            {actions}
        </header>
    );
}
