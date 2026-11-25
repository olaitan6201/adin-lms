import type { Material } from './contracts';
import { ExternalResource } from './ExternalResource';
import { ResourceForm } from './ResourceForm';

type ResourceReaderProps = {
    material: Material;
    action?: string;
};

export function ResourceReader({ material, action }: ResourceReaderProps) {
    return (
        <article id={`resource-${material.id}`} className="my-4 space-y-2 border-l-2 pl-4">
            <h3 className="font-semibold">{material.title}</h3>
            {material.versions.map((v) => {
                const Player = v.media?.type.startsWith('audio/') ? 'audio' : 'video';
                return (
                    <div key={v.revision} className="space-y-2">
                        <small>
                            Revision {v.revision}
                            {v.author && ` · ${v.author}`}
                        </small>
                        {v.body && <p className="whitespace-pre-wrap">{v.body}</p>}
                        {v.image && <img loading="lazy" className="max-w-full" src={v.image} alt={material.title} />}
                        {v.media && (
                            <Player controls preload="metadata" aria-label={material.title} className="max-w-full">
                                <source src={v.media.src} type={v.media.type} />
                                {v.caption && (
                                    <track kind="captions" label="English" srcLang="en" src={v.caption} default />
                                )}
                            </Player>
                        )}
                        {v.external_url && <ExternalResource href={v.external_url} title={material.title} />}
                        {v.transcript && (
                            <details>
                                <summary>Read transcript</summary>
                                <p className="whitespace-pre-wrap">{v.transcript}</p>
                            </details>
                        )}
                        {v.caption && (
                            <a href={v.caption} className="block underline">
                                Read timestamped captions
                            </a>
                        )}
                        {v.download && (
                            <a className="underline" href={v.download} download>
                                Download {material.title} (revision {v.revision})
                            </a>
                        )}
                    </div>
                );
            })}
            {action && <ResourceForm action={action} item={material} />}
        </article>
    );
}
