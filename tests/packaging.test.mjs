import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { build } from '../scripts/build.mjs';
import { capture } from '../scripts/capture.mjs';
import { check, json, files, sha256, resolveInside, loadCatalog } from '../scripts/check.mjs';

async function fixture(t, { animation = false, html = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="20"/></svg>' } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'visual packaging space-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const put = async (relative, content) => {
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    await writeFile(path.join(root, relative), content);
  };
  const promptHash = sha256(Buffer.from('exact prompt\r\n'));
  await put('prompts/deep/p.md', 'exact prompt\r\n');
  await put('web/index.html', '<script src="app.js"></script>');
  await put('web/app.js', "fetch('data/catalog.json')");
  await put('builds/p/m/index.html', html);
  await put('builds/p/m/NOTES.md', 'unchanged notes\r\n');
  await put('builds/p/m/other.html', '<script>never publish</script>');
  await put('catalog/models.json', JSON.stringify([{ id: 'm' }]));
  await put('catalog/prompts.json', JSON.stringify([{ id: 'p', path: 'prompts/deep/p.md', sha256: promptHash, kind: animation ? 'animation' : 'static', duration: animation ? 0.2 : null }]));
  await put('catalog/runs.json', JSON.stringify([{ id: 'p-m', promptId: 'p', modelId: 'm', promptHash, directory: 'builds/p/m', status: 'failed', elapsedSeconds: 45, score: null, t3: { threadId: 'preserve-this' } }]));
  return { root, put };
}

test('packaging preserves exact source bytes, hashes, provenance and nested deployment paths', async t => {
  const { root } = await fixture(t);
  const catalog = await build(root);
  await check(root);
  const run = catalog.runs[0];
  assert.equal(run.status, 'failed');
  assert.equal(run.elapsedSeconds, 45);
  assert.deepEqual(run.t3, { threadId: 'preserve-this' });
  assert.deepEqual(await readFile(path.join(root, 'site', run.source)), await readFile(path.join(root, 'builds/p/m/index.html')));
  assert.equal(run.sourceHash, sha256(await readFile(path.join(root, 'site', run.source))));
  assert.equal(run.notes, 'sources/p-m/NOTES.md.txt');
  assert.deepEqual((await files(path.join(root, 'site'))).filter(p => p.endsWith('.html')), ['index.html']);
  for (const relative of [run.source, run.notes, catalog.prompts[0].path, 'data/catalog.json']) {
    const url = new URL(relative, 'https://example.test/owner/repository/');
    assert.ok(url.pathname.startsWith('/owner/repository/'));
    assert.ok(!relative.includes('\\'));
  }
  await writeFile(path.join(root, 'site', run.source), 'tampered');
  await assert.rejects(check(root), /SHA/);
});

test('catalog rejects traversal, broken references, duplicate IDs and changed prompts', async t => {
  const { root, put } = await fixture(t);
  for (const relative of ['../escape', '/absolute', 'C:/escape', 'a\\b', 'https://host/file', 'a/../b']) assert.throws(() => resolveInside(root, relative));
  const runs = await json(path.join(root, 'catalog/runs.json'));
  await put('catalog/runs.json', JSON.stringify([...runs, ...runs]));
  await assert.rejects(loadCatalog(root), /duplicate/);
  await put('catalog/runs.json', JSON.stringify([{ ...runs[0], modelId: 'missing' }]));
  await assert.rejects(loadCatalog(root), /references/);
  await put('catalog/runs.json', JSON.stringify(runs));
  await put('prompts/deep/p.md', 'changed');
  await assert.rejects(loadCatalog(root), /SHA/);
});

test('real capture blocks remote HTTP and WebSocket, records errors, and preserves failed completion', async t => {
  let requests = 0;
  const server = http.createServer((req, res) => { requests++; res.end('must not be reached'); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const html = `<svg xmlns="http://www.w3.org/2000/svg"></svg><img src="${origin}/remote"><script>console.error('fixture console');new WebSocket('${origin.replace('http:', 'ws:')}/socket'); throw new Error('fixture page error')</script>`;
  const { root } = await fixture(t, { html });
  assert.equal((await capture(root)).failures, 0);
  const validation = await json(path.join(root, 'captures/p-m/validation.json'));
  assert.equal(validation.status, 'captured-with-errors');
  assert.equal(validation.svgPresent, true);
  assert.equal(validation.bytes, Buffer.byteLength(html));
  assert.equal(validation.sourceHash, sha256(Buffer.from(html)));
  assert.equal(validation.playwrightVersion, '1.65.0');
  assert.ok(validation.consoleErrors.some(e => e.includes('fixture console')));
  assert.ok(validation.pageErrors.some(e => e.includes('fixture page error')));
  assert.ok(validation.networkAttempts.some(e => e.url.includes('/remote')));
  assert.ok(validation.networkAttempts.some(e => e.method === 'WEBSOCKET'));
  assert.equal(requests, 0);
  const png = await readFile(path.join(root, validation.poster));
  assert.equal(png.readUInt32BE(16), 1600);
  assert.equal(png.readUInt32BE(20), 900);
  const runs = await json(path.join(root, 'catalog/runs.json'));
  assert.equal(runs[0].status, 'failed');
  assert.equal(runs[0].elapsedSeconds, 45);
  assert.deepEqual(runs[0].t3, { threadId: 'preserve-this' });
  assert.equal(runs[0].score, null);
  await build(root);
  await check(root);
});

test('animation captures fixed query frames and playable WebM; stale evidence is excluded', async t => {
  const { root, put } = await fixture(t, { animation: true, html: '<svg></svg><script>document.body.dataset.t=new URLSearchParams(location.search).get("t")</script>' });
  await capture(root);
  const validation = await json(path.join(root, 'captures/p-m/validation.json'));
  assert.equal(validation.status, 'captured');
  assert.deepEqual(validation.frames.map(f => f.time), [0, 0.05, 0.1, 0.15000000000000002]);
  const clip = await readFile(path.join(root, validation.clip));
  assert.equal(clip.subarray(0, 4).toString('hex'), '1a45dfa3');
  await build(root);
  await check(root);
  await put('builds/p/m/index.html', '<svg>changed</svg>');
  const catalog = await build(root);
  assert.equal(catalog.runs[0].captureStatus, 'stale');
  assert.equal(catalog.runs[0].poster, null);
  assert.equal(catalog.runs[0].validation, null);
  assert.ok((await files(path.join(root, 'captures'))).includes(validation.poster.replace('captures/', '')));
  await check(root);
});

test('missing source remains pending technical evidence without changing completion', async t => {
  const { root } = await fixture(t);
  await rm(path.join(root, 'builds/p/m/index.html'));
  await capture(root);
  const catalog = await build(root);
  assert.equal(catalog.runs[0].status, 'failed');
  assert.equal(catalog.runs[0].captureStatus, 'missing-source');
  assert.equal(catalog.runs[0].source, null);
  await check(root);
});

test('capture failures retain partial artifacts and every previous attempt', async t => {
  const { root, put } = await fixture(t, { animation: true });
  const prompts = await json(path.join(root, 'catalog/prompts.json'));
  prompts[0].duration = 61; // Deliberate invalid capture metadata, after poster capture.
  await put('catalog/prompts.json', JSON.stringify(prompts));
  assert.equal((await capture(root)).failures, 1);
  const first = await json(path.join(root, 'captures/p-m/validation.json'));
  assert.equal(first.status, 'capture-error');
  assert.ok(first.poster);
  assert.ok(first.clip);
  assert.ok(first.errors.some(e => e.includes('duration')));
  assert.equal((await capture(root)).failures, 1);
  const second = await json(path.join(root, 'captures/p-m/validation.json'));
  assert.notEqual(first.poster, second.poster);
  assert.ok((await readFile(path.join(root, first.poster))).length > 0);
  assert.ok((await readFile(path.join(root, second.poster))).length > 0);
  await build(root);
  await check(root);
});
