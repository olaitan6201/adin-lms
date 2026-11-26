import assert from 'node:assert/strict';
import { test } from 'node:test';
import { encodeWorkbook } from '../../resources/js/components/reports/reportWorkbook.ts';

test('workbook preserves numeric vs text cells and escapes worksheet names and cell contents', () => {
    const title = 'A&B "sample" <quarter> in a long worksheet title';
    const xml = encodeWorkbook([{ title, columns: ['A < B'], rows: [[1.25, '001', '"<x>&"']] }]);
    assert.match(xml, /ss:Name="A&amp;B &quot;sample&quot; &lt;quarter&gt; in a lon"/);
    assert.match(xml, /<Data ss:Type="Number">1\.25<\/Data>/);
    assert.match(xml, /<Data ss:Type="String">001<\/Data>/);
    assert.match(xml, /<Data ss:Type="String">&quot;&lt;x&gt;&amp;&quot;<\/Data>/);
    assert.match(xml, /A &lt; B/);
});
