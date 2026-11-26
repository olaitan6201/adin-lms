import { Check, FileText, LockKeyhole } from 'lucide-react';
import type { Lesson } from './contracts';

export function LessonNavigation({ lessons }: { lessons: Lesson[] }) {
    return (
        <nav className="course-panel" aria-label="Course content">
            <div className="course-panel-head">
                <h2>Course content</h2>
                <span>
                    {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                </span>
            </div>
            <ul>
                {lessons.map((lesson) => {
                    const Icon = lesson.locked ? LockKeyhole : lesson.completed_at ? Check : FileText;
                    return (
                        <li key={lesson.id}>
                            <a className="course-module" href={`#lesson-${lesson.id}`}>
                                <Icon aria-hidden />
                                <span>
                                    <small className="course-code">Lesson {lesson.position}</small>
                                    <strong className="block">{lesson.title}</strong>
                                    <small>
                                        {lesson.locked ? 'Locked' : lesson.completed_at ? 'Completed' : lesson.kind}
                                    </small>
                                </span>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
