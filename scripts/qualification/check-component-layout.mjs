import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseSync } from 'vite';

function components(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
            return components(path);
        }
        return path.endsWith('.tsx') ? [path] : [];
    });
}

const files = components('resources/js');
const failures = [];

for (const file of files) {
    const source = readFileSync(file, 'utf8');
    const { program, errors } = parseSync(file, source);
    if (errors.length) {
        throw new Error(`Cannot inspect ${file}: ${errors[0].message}`);
    }

    function requireBreak(left, right, reason) {
        if (!source.slice(left, right).includes('\n')) {
            const line = source.slice(0, right).split('\n').length;
            failures.push(`${file}:${line}: ${reason}`);
        }
    }

    function inspect(node) {
        if (!node || typeof node !== 'object') {
            return;
        }

        if (node.type === 'Program' || node.type === 'BlockStatement' || node.type === 'SwitchCase') {
            const statements = node.type === 'SwitchCase' ? node.consequent : node.body;
            for (let i = 1; i < statements.length; i++) {
                requireBreak(statements[i - 1].end, statements[i].start, 'Use one statement per line');
            }
            if (node.type === 'BlockStatement' && statements.length) {
                requireBreak(node.start + 1, statements[0].start, 'Expand the statement block');
                requireBreak(statements.at(-1).end, node.end - 1, 'Close the block on its own line');
            }
        }

        if (node.type === 'IfStatement' && node.consequent.type !== 'BlockStatement') {
            requireBreak(node.test.end, node.consequent.start, 'Separate the condition from its action');
        }

        if (node.type === 'ReturnStatement' && ['JSXElement', 'JSXFragment'].includes(node.argument?.type)) {
            if (source.slice(node.argument.start, node.argument.end).includes('\n')) {
                requireBreak(node.start, node.argument.start, 'Put a multiline JSX return on its own indented lines');
            }
        }

        if (node.type === 'JSXElement' || node.type === 'JSXFragment') {
            const opening = node.openingElement ?? node.openingFragment;
            const closing = node.closingElement ?? node.closingFragment;
            const children = node.children.filter((child) => child.type !== 'JSXText' || child.value.trim());
            for (const [index, child] of children.entries()) {
                if (child.type !== 'JSXElement' && child.type !== 'JSXFragment') {
                    continue;
                }
                const previous = children[index - 1];
                const next = children[index + 1];
                if (!previous || previous.type === 'JSXElement' || previous.type === 'JSXFragment') {
                    requireBreak(previous?.end ?? opening.end, child.start, 'Put each nested JSX element on its own line');
                }
                if (!next && closing) {
                    requireBreak(child.end, closing.start, 'Separate nested JSX closing tags');
                }
            }
        }

        if (node.type === 'JSXOpeningElement' && node.attributes.length >= 4) {
            let previous = node.name.end;
            for (const attribute of node.attributes) {
                requireBreak(previous, attribute.start, 'Put each prop of a multi-prop element on its own line');
                previous = attribute.end;
            }
        }

        Object.values(node).forEach(inspect);
    }

    inspect(program);
}

if (failures.length) {
    console.error([...new Set(failures)].join('\n'));
    process.exitCode = 1;
} else {
    console.log(`Component layout passed: ${files.length} TSX files.`);
}
