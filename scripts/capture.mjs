// Technical capture only. This script never invokes a model or edits an entrant.
import { chromium } from 'playwright';
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { loadCatalog, exists, regularFile, resolveInside, sha256, json } from './check.mjs';

const require = createRequire(import.meta.url);
const playwrightVersion = require('playwright/package.json').version;
const viewport = { width: 1600, height: 900 };

export async function capture(root = process.cwd(), { runIds = [] } = {}) {
  const catalog = await loadCatalog(root);
  for (const id of runIds) if (!catalog.runs.some(r => r.id === id)) throw new Error(`Unknown run: ${id}`);
  let browser;
  let launchError;
  let failures = 0;
  try {
    for (const run of catalog.runs.filter(r => !runIds.length || runIds.includes(r.id))) {
      const started = Date.now();
      const prompt = catalog.prompts.find(p => p.id === run.promptId);
      const directory = `captures/${run.id}`;
      // Every attempt has a unique directory: failed and previous captures survive reruns.
      const attempt = `${directory}/${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}`;
      await mkdir(resolveInside(root, attempt), { recursive: true });
      const result = {
        runId: run.id, capturedAt: new Date().toISOString(), playwrightVersion,
        browserVersion: null, viewport, deviceScaleFactor: 1,
        status: 'missing-source', sourceHash: null, bytes: 0,
        consoleErrors: [], pageErrors: [], networkAttempts: [], svgPresent: null,
        poster: null, clip: null, frames: [], errors: [],
        // No quality or correctness judgment is made by these observations.
        captureElapsedSeconds: null,
      };
      const limitedPush = (array, value) => { if (array.length < 200) array.push(value); };
      let context;
      let video;
      const entry = `${run.directory}/index.html`;
      try {
        if (await exists(resolveInside(root, entry))) {
          const source = await regularFile(root, entry);
          const bytes = await readFile(source);
          result.sourceHash = sha256(bytes);
          result.bytes = bytes.length;
          result.status = 'capture-error';
          if (!browser && !launchError) {
            try { browser = await chromium.launch({ args: ['--disable-background-networking'] }); }
            catch (error) { launchError = error; }
          }
          if (launchError) throw launchError;
          result.browserVersion = browser.version();
          context = await browser.newContext({
            viewport, deviceScaleFactor: 1, offline: true, serviceWorkers: 'block',
            acceptDownloads: false,
            ...(prompt.kind === 'animation' ? { recordVideo: { dir: resolveInside(root, `${attempt}/video`), size: viewport } } : {}),
          });
          context.on('request', request => {
            if (!/^(file:|data:|blob:|about:)/.test(request.url())) limitedPush(result.networkAttempts, { url: request.url(), method: request.method(), blocked: true });
          });
          await context.route('**/*', route => {
            const url = route.request().url();
            if (/^(data:|blob:|about:)/.test(url)) return route.continue();
            if (url.startsWith('file:')) {
              const local = fileURLToPath(url);
              if (local === source || local.startsWith(path.dirname(source) + path.sep)) return route.continue();
            }
            return route.abort('blockedbyclient');
          });
          await context.routeWebSocket('**/*', socket => {
            limitedPush(result.networkAttempts, { url: socket.url(), method: 'WEBSOCKET', blocked: true });
            socket.close();
          });
          context.on('page', page => {
            page.on('console', message => { if (message.type() === 'error') limitedPush(result.consoleErrors, message.text()); });
            page.on('pageerror', error => limitedPush(result.pageErrors, error.message));
            page.on('dialog', dialog => dialog.dismiss().catch(() => {}));
          });
          const page = await context.newPage();
          page.setDefaultTimeout(10000);
          page.setDefaultNavigationTimeout(15000);
          video = page.video();
          const url = pathToFileURL(source);
          const navigate = async time => {
            const target = new URL(url);
            if (time !== undefined) target.searchParams.set('t', String(time));
            await page.goto(target.href, { waitUntil: 'load' });
            await page.waitForTimeout(250);
          };
          await navigate(0);
          result.svgPresent = await page.locator('svg').count() > 0;
          const poster = `${attempt}/poster.png`;
          await page.screenshot({ path: resolveInside(root, poster), timeout: 10000 });
          result.poster = poster;
          if (prompt.kind === 'animation') {
            if (!(prompt.duration > 0 && prompt.duration <= 60)) throw new Error('Animation duration must be in (0, 60] seconds');
            for (const time of [0, prompt.duration / 4, prompt.duration / 2, 3 * prompt.duration / 4]) {
              await navigate(time);
              const frame = { time, path: `${attempt}/frame-${time}.png` };
              await page.screenshot({ path: resolveInside(root, frame.path), timeout: 10000 });
              result.frames.push(frame);
            }
            // Record actual animation without the fixed-time query. The WebM also
            // includes the preceding sampled-frame navigation, documented here.
            result.clipMode = 'sampled-frames-then-realtime-loop';
            await navigate();
            await page.waitForTimeout(prompt.duration * 1000);
          }
          result.status = result.consoleErrors.length || result.pageErrors.length || result.networkAttempts.length ? 'captured-with-errors' : 'captured';
          if (sha256(await readFile(source)) !== result.sourceHash) throw new Error('Source changed during capture');
        }
      } catch (error) {
        result.status = 'capture-error';
        result.errors.push(error.message);
        failures++;
      } finally {
        if (context) {
          try {
            await context.close(); // Playwright finalizes WebM on context close.
            if (video) {
              const clip = `${attempt}/clip.webm`;
              await copyFile(await video.path(), resolveInside(root, clip));
              result.clip = clip;
            }
          } catch (error) {
            result.errors.push(error.message);
            result.status = 'capture-error';
            failures++;
          }
        }
      }
      result.captureElapsedSeconds = (Date.now() - started) / 1000;
      const validation = `${directory}/validation.json`;
      const text = JSON.stringify(result, null, 2) + '\n';
      await writeFile(resolveInside(root, `${attempt}/validation.json`), text);
      await writeFile(resolveInside(root, validation), text);
      // Re-read before merging so T3 completion and provenance updates survive.
      const runsPath = path.join(root, 'catalog/runs.json');
      const latest = await json(runsPath);
      const target = latest.find(r => r.id === run.id);
      if (!target) throw new Error(`Run removed during capture: ${run.id}`);
      Object.assign(target, {
        poster: result.poster, clip: result.clip,
        source: result.sourceHash ? `sources/${run.id}/index.html.txt` : null,
        notes: await exists(resolveInside(root, `${run.directory}/NOTES.md`)) ? `sources/${run.id}/NOTES.md.txt` : null,
        sourceHash: result.sourceHash, validation, captureStatus: result.status,
        elapsedSeconds: target.elapsedSeconds ?? null,
      });
      await writeFile(runsPath, JSON.stringify(latest, null, 2) + '\n');
      console.log(`${run.id}: ${result.status}`);
    }
  } finally { if (browser) await browser.close(); }
  return { failures };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const { failures } = await capture(process.cwd(), { runIds: process.argv.slice(2) });
  if (failures) process.exitCode = 1;
}
