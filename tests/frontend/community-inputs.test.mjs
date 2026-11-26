import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let server;
before(async () => {
    server = await createServer({
        configFile: false, appType: 'custom',
        resolve: { alias: { '@': fileURLToPath(new URL('../../resources/js/', import.meta.url)) } },
        server: { middlewareMode: true, hmr: false, watch: null },
    });
});
after(() => server.close());

for (const [view, props, action, noun] of [
    ['Forums', { forums: [], threads: [] }, 'New forum', 'forum'],
    ['Groups', { discussionGroups: [], groupPosts: [] }, 'Create group', 'group'],
]) {
    test(`${view} explains why creation is unavailable without course choices`, async () => {
        const module = await server.ssrLoadModule(`/resources/js/components/community/${view}.tsx`);
        const html = renderToStaticMarkup(createElement(module[view], { ...props, student: false }));
        assert.match(html, new RegExp(`No courses available for ${noun} creation`));
        const button = html.match(/<button\b[^>]*>[\s\S]*?<\/button>/g)?.find(markup => markup.includes(action));
        assert.match(button ?? '', /^<button\b[^>]*disabled=""/);
        assert.doesNotMatch(html, /<dialog\b/);
    });
}

for (const recipients of [[], [{ id: 'missing', name: null }, { id: 'blank', name: '   ' }]]) {
    test(`composer cannot send with ${recipients.length ? 'unnamed' : 'no'} recipients`, async () => {
        const { Messages } = await server.ssrLoadModule('/resources/js/components/community/Messages.tsx');
        const html = renderToStaticMarkup(createElement(Messages, { inbox: { messages: [] }, composing: true, recipients }));
        assert.match(html, /No recipients available/);
        assert.match(html, /<button[^>]*disabled=""[^>]*>Send sample message/);
        assert.doesNotMatch(html, /<option\b/);
    });
}

test('a closed thread neither offers a student reply form nor accepts a stale reply', async () => {
    const { TopicEditor } = await server.ssrLoadModule('/resources/js/components/community/TopicEditor.tsx');
    const { applyTopicChange } = await server.ssrLoadModule('/resources/js/components/community/forumBoard.ts');
    const { communication } = await server.ssrLoadModule('/resources/js/data/community/communication.ts');
    const topic = { ...communication.threads[1], allowReplies: false };
    const board = { forums: communication.forums, topics: [topic] };
    const html = renderToStaticMarkup(createElement(TopicEditor, { student: true, topic, forums: board.forums }));
    assert.match(html, /This thread is closed to replies/);
    assert.doesNotMatch(html, /textarea|Move thread|Post reply/);
    assert.equal(applyTopicChange(board, { kind: 'reply', topicId: topic.id, reply: 'late' }), board);
});
