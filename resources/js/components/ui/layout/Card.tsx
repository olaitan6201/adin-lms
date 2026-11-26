import type { ReactNode } from 'react';

type CardProps = {
    title?: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
    bodyClassName?: string;
    className?: string;
};

export function Card({ title, subtitle, actions, children, bodyClassName = 'p-5', className = '' }: CardProps) {
    return (
        <section className={`card min-w-0 ${className}`}>
            {(title || subtitle || actions) && (
                <div className="card-head">
                    <div className="min-w-0 flex-1">
                        {title && <h2 className="card-title">{title}</h2>}
                        {subtitle && <p className="card-subtitle">{subtitle}</p>}
                    </div>
                    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
                </div>
            )}
            <div className={bodyClassName}>{children}</div>
        </section>
    );
}
