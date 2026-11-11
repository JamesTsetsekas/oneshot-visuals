// Tiny DOM helper. Text is always inserted as text nodes / textContent, never as HTML.

export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k.length > 2 && k.startsWith('on') && typeof v === 'function') {
        el.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (k === 'class') {
        el.className = String(v);
      } else if (k === 'text') {
        el.textContent = String(v);
      } else if (k === 'dataset') {
        for (const [dk, dv] of Object.entries(v)) el.dataset[dk] = String(dv);
      } else if (v === true) {
        el.setAttribute(k, '');
      } else {
        el.setAttribute(k, String(v));
      }
    }
  }
  append(el, kids);
  return el;
}

export function append(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
  return el;
}

export function frag(...kids) {
  return append(document.createDocumentFragment(), kids);
}
