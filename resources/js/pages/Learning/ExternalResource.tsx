import { useState } from 'react';

function playerUrl(href: string): string | null {
    let url: URL;
    try {
        url = new URL(href);
    } catch {
        return null;
    }

    if (url.protocol !== 'https:') {
        return null;
    }

    const video =
        url.hostname === 'youtu.be'
            ? url.pathname.slice(1)
            : ['www.youtube.com', 'youtube.com'].includes(url.hostname) &&
                url.pathname === '/watch'
              ? url.searchParams.get('v')
              : null;
    if (video && /^[A-Za-z0-9_-]{11}$/.test(video)) {
        return `https://www.youtube-nocookie.com/embed/${video}`;
    }

    if (['vimeo.com', 'www.vimeo.com'].includes(url.hostname) && /^\/\d+$/.test(url.pathname)) {
        return `https://player.vimeo.com/video${url.pathname}`;
    }

    return null;
}

interface ExternalResourceProps {
    href: string;
    title: string;
}

export function ExternalResource({ href, title }: ExternalResourceProps) {
    const [playing, setPlaying] = useState(false);
    const player = playerUrl(href);
    return (
        <div className="space-y-2">
            <a className="underline" href={href} rel="noreferrer">
                Open {title}
            </a>
            {player && (
                <div className="grid aspect-video w-full place-items-center rounded border">
                    {playing ? (
                        <iframe
                            className="h-full w-full"
                            title={title}
                            src={player}
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setPlaying(true)}
                            className="rounded border px-3 py-2"
                        >
                            Load external video
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
