import { Link } from '@inertiajs/react';

type Props = {
    id: string;
    visible: boolean;
    teaching: boolean;
    tools: string;
    readings: string | null;
};

export function CourseTools({ id, visible, teaching, tools, readings }: Props) {
    const base = `/courses/${id}`;
    return (
        <nav aria-label="Course tools" className="course-panel course-tool-nav">
            <span aria-current="page">Overview</span>
            {visible && (
                <>
                    <Link href={`${base}/learning`}>
                        {teaching ? 'Author or preview lessons' : 'Lessons and materials'}
                    </Link>
                    <Link href={`${base}/assessments`}>Assessments</Link>
                    <Link href={`${base}/learning/classes`}>Classroom and attendance</Link>
                    <Link href={tools}>Library and learning tools</Link>
                    {readings && <a href={readings}>Packaged readings</a>}
                </>
            )}
            <Link href={`/community/courses/${id}`}>Course board</Link>
        </nav>
    );
}
