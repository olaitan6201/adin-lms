import { Head, Link, usePage } from '@inertiajs/react';

export default function Home() {
    const { signedIn } = usePage<{ signedIn: boolean }>().props;
    return (
        <main className="portal-page portal-entry">
            <Head title="Learning portal" />
            <div className="entry-intro">
                <img className="mb-6 h-12 w-auto" src={document.body.dataset.logoFull} alt="Adin LMS" />
                <p className="portal-kicker">Academic workspace</p>
                <h1 className="portal-title">Learning portal</h1>
                <p>Open your course materials, attend scheduled classes and return to your assessments.</p>
                <Link className="portal-action" href={signedIn ? '/dashboard' : '/login'}>
                    {signedIn ? 'Open dashboard' : 'Sign in to the portal'} →
                </Link>
            </div>
            <aside className="portal-panel desk-shelf">
                <h2 className="desk-section">Course registration</h2>
                <p>Registration is managed through the institution’s registration platform. Your registered courses appear here after the roster is updated.</p>
            </aside>
        </main>
    );
}
