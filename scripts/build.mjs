import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadCatalog, exists, regularFile, resolveInside, files, sha256, json } from './check.mjs';

export async function build(root = process.cwd()) {
  const catalog = await loadCatalog(root);
  const site = path.resolve(root, 'site');
  const web = path.join(root, 'web');
  const assets = await files(web); // Fail before removing a previous build if dashboard is absent.
  // Fixed, verified output directory; never derived from catalog input.
  if (site !== path.join(path.resolve(root), 'site')) throw new Error('Invalid output directory');
  await rm(site, { recursive: true, force: true });
  const put = async (relative, bytes) => {
    const destination = resolveInside(site, relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes);
  };
  for (const asset of assets) {
    if (/^(data|sources|prompts|captures)\//.test(asset)) throw new Error(`Reserved dashboard directory: ${asset}`);
    await put(asset, await readFile(await regularFile(web, asset)));
  }
  if (await exists(path.join(root, 'prompts/VIS-CONTRACT.md'))) {
    await put('prompts/VIS-CONTRACT.txt', await readFile(await regularFile(root, 'prompts/VIS-CONTRACT.md')));
  }
  for (const prompt of catalog.prompts) {
    const bytes = await readFile(await regularFile(root, prompt.path));
    prompt.path = `prompts/${prompt.id}.txt`;
    await put(prompt.path, bytes);
  }
  for (const run of catalog.runs) {
    const entry = `${run.directory}/index.html`;
    Object.assign(run, { poster: null, clip: null, source: null, notes: null, validation: null, sourceHash: null, elapsedSeconds: run.elapsedSeconds ?? null });
    if (await exists(resolveInside(root, entry))) {
      const bytes = await readFile(await regularFile(root, entry));
      run.source = `sources/${run.id}/index.html.txt`;
      run.sourceHash = sha256(bytes);
      await put(run.source, bytes);
    }
    const notes = `${run.directory}/NOTES.md`;
    if (await exists(resolveInside(root, notes))) {
      run.notes = `sources/${run.id}/NOTES.md.txt`;
      await put(run.notes, await readFile(await regularFile(root, notes)));
    }
    const validationPath = `captures/${run.id}/validation.json`;
    if (await exists(resolveInside(root, validationPath))) {
      const validation = await json(await regularFile(root, validationPath));
      if (validation.sourceHash === run.sourceHash) {
        run.validation = validationPath;
        run.captureStatus = validation.status;
        await put(validationPath, JSON.stringify(validation, null, 2) + '\n');
        for (const [key, extension] of [['poster', '.png'], ['clip', '.webm']]) {
          const asset = validation[key];
          if (asset) {
            if (!asset.startsWith(`captures/${run.id}/`) || !asset.endsWith(extension)) throw new Error(`Invalid capture asset: ${asset}`);
            await put(asset, await readFile(await regularFile(root, asset)));
            run[key] = asset;
          }
        }
        for (const frame of validation.frames ?? []) {
          if (!frame.path.startsWith(`captures/${run.id}/`) || !frame.path.endsWith('.png')) throw new Error('Invalid frame path');
          await put(frame.path, await readFile(await regularFile(root, frame.path)));
        }
      } else run.captureStatus = 'stale';
    }
  }
  await put('data/catalog.json', JSON.stringify(catalog, null, 2) + '\n');
  await put('.nojekyll', '');
  return catalog;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = await build();
  console.log(`Packaged ${result.runs.length} entries into site/ (entrant source is text only).`);
}
