import { Fragment, type ReactNode } from 'react';

function inline(text: string) {
    return text.split(/(\[[^\]\n]+\]\([^\s)]+\))/g).map((part, index) => {
        const link =
            /^\[([^\]]+)\]\((https:\/\/[^\s)]+|\/courses\/[a-f0-9-]+\/assessments(?:#item-[a-f0-9-]+)?)\)$/.exec(part);
        return link ? (
            <a className="underline" key={index} href={link[2]}>
                {link[1]}
            </a>
        ) : (
            part
        );
    });
}

type ManuscriptProps = {
    text?: string | null;
    resource?: (id: string) => ReactNode;
};

export function Manuscript({ text, resource }: ManuscriptProps) {
    const blocks = (text || '')
        .replace(/\r\n/g, '\n')
        .trim()
        .split(/\n\s*\n/);
    return (
        <div className="space-y-4 leading-relaxed">
            {blocks.map((block, i) => {
                const lines = block.split('\n');
                const media = /^\{\{resource:([a-f0-9-]{36})\}\}$/.exec(block);
                if (media)
                    return <Fragment key={i}>{resource ? resource(media[1]) : 'Linked learning resource'}</Fragment>;

                if (block.startsWith('## '))
                    return (
                        <div key={i}>
                            <h3 className="text-lg font-semibold">{lines[0].slice(3)}</h3>
                            {lines.length > 1 && (
                                <p className="whitespace-pre-line">{inline(lines.slice(1).join('\n'))}</p>
                            )}
                        </div>
                    );

                if (lines.every((line) => line.startsWith('- ')))
                    return (
                        <ul key={i} className="list-disc pl-6">
                            {lines.map((line, n) => (
                                <li key={n}>{inline(line.slice(2))}</li>
                            ))}
                        </ul>
                    );

                return (
                    <p key={i} className="whitespace-pre-line">
                        {inline(block)}
                    </p>
                );
            })}
        </div>
    );
}
