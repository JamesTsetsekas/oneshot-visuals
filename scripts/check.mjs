import { readFile, lstat, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const sha256 = data => createHash('sha256').update(data).digest('hex');
export const json = async file => JSON.parse(await readFile(file, 'utf8'));
export async function exists(file) {
  try { await lstat(file); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}
export function resolveInside(root, relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.includes(':') || relative.includes('?') || relative.includes('#') || path.posix.isAbsolute(relative) || relative.split('/').some(p => !p || p === '.' || p === '..')) throw new Error(`Unsafe relative path: ${relative}`);
  const result = path.resolve(root, relative);
  if (!result.startsWith(path.resolve(root) + path.sep)) throw new Error(`Path escapes root: ${relative}`);
  return result;
}
export async function regularFile(root, relative) {
  const file = resolveInside(root, relative);
  const resolved = await realpath(file);
  const base = await realpath(root);
  if (!resolved.startsWith(base + path.sep) || !(await lstat(file)).isFile()) throw new Error(`Not a contained regular file: ${relative}`);
  return file;
}
export async function files(root, prefix = '') {
  const result = [];
  for (const entry of await readdir(path.join(root, prefix), { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Symlink is not publishable: ${relative}`);
    if (entry.isDirectory()) result.push(...await files(root, relative));
    else if (entry.isFile()) result.push(relative);
  }
  return result;
}
export async function loadCatalog(root) {
  const [models, prompts, runs] = await Promise.all(['models', 'prompts', 'runs'].map(name => json(path.join(root, 'catalog', `${name}.json`))));
  for (const [name, rows] of Object.entries({ models, prompts, runs })) {
    if (!Array.isArray(rows) || new Set(rows.map(r => r.id)).size !== rows.length || rows.some(r => !/^[A-Za-z0-9_-]+$/.test(r.id))) throw new Error(`Invalid or duplicate ${name} IDs`);
  }
  for (const prompt of prompts) {
    const hash = sha256(await readFile(await regularFile(root, prompt.path)));
    if (hash !== prompt.sha256) throw new Error(`Prompt SHA mismatch: ${prompt.id}`);
  }
  for (const run of runs) {
    const prompt = prompts.find(p => p.id === run.promptId);
    if (!prompt || !models.some(m => m.id === run.modelId) || run.promptHash !== prompt.sha256) throw new Error(`Invalid run references: ${run.id}`);
    resolveInside(root, run.directory);
  }
  return { models, prompts, runs };
}
export async function check(root = process.cwd()) {
  const catalog = await loadCatalog(root);
  const site = path.join(root, 'site');
  if (!(await exists(site))) return;
  const published = await json(path.join(site, 'data/catalog.json'));
  if (published.runs.length !== catalog.runs.length || published.prompts.length !== catalog.prompts.length || published.models.length !== catalog.models.length) throw new Error('Published catalog counts differ');
  for (const key of ['models', 'prompts', 'runs']) {
    const ids = published[key].map(row => row.id).sort();
    if (JSON.stringify(ids) !== JSON.stringify(catalog[key].map(row => row.id).sort())) throw new Error(`Published ${key} IDs differ`);
  }
  const webFiles = new Set(await files(path.join(root, 'web')));
  for (const file of await files(site)) {
    if (/\.html?$/i.test(file) && !webFiles.has(file)) throw new Error(`Entrant HTML published: ${file}`);
  }
  for (const prompt of published.prompts) {
    const original = catalog.prompts.find(p => p.id === prompt.id);
    if (prompt.sha256 !== original.sha256 || !prompt.path.endsWith('.txt') || sha256(await readFile(await regularFile(site, prompt.path))) !== prompt.sha256) throw new Error(`Published prompt mismatch: ${prompt.id}`);
  }
  for (const run of published.runs) {
    const original = catalog.runs.find(r => r.id === run.id);
    if (!original) throw new Error(`Unknown published run: ${run.id}`);
    for (const key of ['poster', 'clip', 'source', 'notes', 'validation']) if (run[key]) await regularFile(site, run[key]);
    if (run.source) {
      if (!run.source.endsWith('.txt')) throw new Error('Source must be text');
      const hash = sha256(await readFile(await regularFile(site, run.source)));
      if (hash !== run.sourceHash || hash !== sha256(await readFile(await regularFile(root, `${original.directory}/index.html`)))) throw new Error(`Source SHA mismatch: ${run.id}`);
      if (run.validation && (await json(resolveInside(site, run.validation))).sourceHash !== hash) throw new Error(`Stale validation: ${run.id}`);
    }
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await check();
  console.log('Catalog, publication paths and SHA hashes verified.');
}
