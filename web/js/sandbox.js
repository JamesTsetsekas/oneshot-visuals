// Safe handling of untrusted generated sources. No imports; no DOM access at load time.

// Policy injected as the first element of every live preview document.
export const PREVIEW_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  'img-src data:',
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'"
].join('; ');

// Never add allow-same-origin: the frame must keep an opaque origin so it cannot
// reach dashboard storage, cookies or DOM.
export const PREVIEW_SANDBOX = 'allow-scripts';

export function buildSrcdoc(source) {
  // Drop a leading doctype (and BOM/whitespace) so our doctype + CSP meta come first;
  // the policy therefore applies before any model-written script is parsed.
  const body = String(source).replace(/^﻿?\s*<!doctype[^>]*>/i, '');
  return `<!doctype html><meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">${body}`;
}

export function createPreviewFrame(source, title) {
  const f = document.createElement('iframe');
  f.setAttribute('sandbox', PREVIEW_SANDBOX); // set before srcdoc/insertion
  f.setAttribute('referrerpolicy', 'no-referrer');
  f.setAttribute('csp', PREVIEW_CSP); // defence in depth where supported
  f.setAttribute('title', title);
  f.setAttribute('allow', '');
  f.srcdoc = buildSrcdoc(source);
  return f;
}

// Accept only simple relative paths that stay inside the site root.
export function safeRelPath(p) {
  if (typeof p !== 'string') return null;
  const s = p.trim();
  if (!s || s.length > 300) return null;
  if (/[\u0000-\u001f\u007f\\]/.test(s)) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(s) || s.startsWith('/')) return null;
  let decoded;
  try {
    decoded = decodeURIComponent(s);
  } catch {
    return null;
  }
  if (/[\\]/.test(decoded) || decoded.split(/[?#]/)[0].split('/').some((seg) => seg === '..')) return null;
  return s.startsWith('./') ? s : './' + s;
}

export async function sha256Hex(buffer) {
  const subtle = globalThis.crypto && globalThis.crypto.subtle;
  if (!subtle) return null;
  const digest = await subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
