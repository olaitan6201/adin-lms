import { useState } from 'react';
import { Card } from '@/components/ui/layout/Card';
import type { ClassSession, SessionDraft } from '@/types/learning/study';

const announcementOptions = ['Send to enrolled students and to guardians with consent', 'Enrolled students only'];

export function SessionDefinition({ session, save }: {
    session?: ClassSession;
    save: (draft: SessionDraft) => void;
}) {
    const [draft, setDraft] = useState<SessionDraft>(() => ({
        title: session?.title ?? '',
        course: session?.course ?? '',
        date: session?.details?.date ?? '',
        start: session?.details?.start ?? '',
        duration: session?.duration ?? '60 min',
        meetingLink: session?.details?.meetingLink ?? '',
        announcement: session?.details?.announcement ?? announcementOptions[0],
    }));
    function update(field: keyof SessionDraft, value: string) {
        setDraft((current) => ({ ...current, [field]: value }));
    }

    return (
        <Card title="Session definition">
            <form
                id="classroom-definition"
                className="space-y-3"
                onSubmit={(event) => {
                    event.preventDefault();
                    save({ ...draft, title: draft.title.trim(), course: draft.course.trim() });
                }}
            >
                <p className="text-sm">
                    Saved changes stay on this page until you leave or reload. No announcement is sent.
                </p>
                <label className="block">
                    <span className="label">Title</span>
                    <input
                        required
                        pattern=".*\S.*"
                        className="input"
                        value={draft.title}
                        onChange={(e) => update('title', e.target.value)}
                    />
                </label>
                <label className="block">
                    <span className="label">Course</span>
                    <input
                        required
                        pattern=".*\S.*"
                        className="input"
                        readOnly={!!session}
                        value={draft.course}
                        onChange={(e) => update('course', e.target.value)}
                    />
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                        <span className="label">Date</span>
                        <input
                            required
                            className="input"
                            type="date"
                            value={draft.date}
                            onChange={(e) => update('date', e.target.value)}
                        />
                    </label>
                    <label className="block">
                        <span className="label">Start time</span>
                        <input
                            required
                            className="input"
                            type="time"
                            value={draft.start}
                            onChange={(e) => update('start', e.target.value)}
                        />
                    </label>
                </div>
                <label className="block">
                    <span className="label">Duration</span>
                    <select
                        className="select"
                        value={draft.duration}
                        onChange={(e) => update('duration', e.target.value)}
                    >
                        {[60, 90, 120].map((minutes) => (
                            <option key={minutes} value={`${minutes} min`}>
                                {minutes} minutes
                            </option>
                        ))}
                    </select>
                </label>
                <label className="block">
                    <span className="label">Meeting link</span>
                    <input
                        className="input"
                        value={draft.meetingLink}
                        onChange={(e) => update('meetingLink', e.target.value)}
                    />
                </label>
                <label className="block">
                    <span className="label">Announcement</span>
                    <select
                        className="select"
                        value={draft.announcement}
                        onChange={(e) => update('announcement', e.target.value)}
                    >
                        {announcementOptions.map((option) => (
                            <option key={option}>{option}</option>
                        ))}
                    </select>
                </label>
            </form>
        </Card>
    );
}
