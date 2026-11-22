/**
 * @file Markdown callouts in boot-log style. A blockquote whose first line is a
 * marker such as `[!WARN]` becomes `<aside class="callout callout--warn">`
 * with a `[WARN]` label; every other blockquote is left alone.
 *
 *   > [!WARN]
 *   > Config moves the fragility, it doesn't remove it.
 *
 * A Sätteri hast plugin (Astro 7's Markdown engine), registered in astro.config.mjs.
 * @module lib/blog/callouts
 */

// Marker (case-insensitive) → [kind, label]. Several markers share a kind so
// GitHub-style alerts (`[!NOTE]`, `[!CAUTION]`) also work.
export const CALLOUTS = {
  NOTE: ['info', '[INFO]'],
  INFO: ['info', '[INFO]'],
  TIP: ['tip', '[TIP]'],
  WARN: ['warn', '[WARN]'],
  WARNING: ['warn', '[WARN]'],
  CAUTION: ['warn', '[WARN]'],
  OK: ['ok', '[ OK ]'],
  SUCCESS: ['ok', '[ OK ]'],
};

const MARKER = /^\s*\[!([a-z]+)\][ \t]*\n?/i;

// A plain copy of a hast node. Sätteri hands plugins lazy proxies; copying
// keeps the replacement tree independent of them.
function clone(node) {
  const copy = { type: node.type };
  if (node.tagName !== undefined) copy.tagName = node.tagName;
  if (node.properties !== undefined) copy.properties = { ...node.properties };
  if (node.value !== undefined) copy.value = node.value;
  if (node.children !== undefined) copy.children = node.children.map(clone);
  return copy;
}

const isElement = (node, tag) => node?.type === 'element' && node.tagName === tag;
const isBlankText = (node) => node.type === 'text' && node.value.trim() === '';

// The callout kind for a blockquote, or null when it isn't one.
export function calloutKind(blockquote) {
  const first = blockquote.children?.find((c) => !isBlankText(c));
  const text = isElement(first, 'p') ? first.children?.[0] : null;
  if (text?.type !== 'text') return null;
  const match = MARKER.exec(text.value);
  return match ? (CALLOUTS[match[1].toUpperCase()] ?? null) : null;
}

// Builds the <aside> that replaces a callout blockquote.
export function toCallout(blockquote) {
  const found = calloutKind(blockquote);
  if (!found) return null;
  const [kind, label] = found;

  const body = blockquote.children.map(clone).filter((c) => !isBlankText(c));
  const firstP = body[0];
  firstP.children[0].value = firstP.children[0].value.replace(MARKER, '');
  if (firstP.children[0].value === '') firstP.children.shift();
  // `> [!WARN]` on its own, followed by a blank `>` line, leaves an empty paragraph.
  if (firstP.children.length === 0) body.shift();

  return {
    type: 'element',
    tagName: 'aside',
    properties: { className: ['callout', `callout--${kind}`], role: 'note' },
    children: [
      { type: 'element', tagName: 'span', properties: { className: ['callout-label'] }, children: [{ type: 'text', value: label }] },
      { type: 'element', tagName: 'div', properties: { className: ['callout-body'] }, children: body },
    ],
  };
}

export const calloutsPlugin = {
  name: 'blog-callouts',
  element: {
    filter: ['blockquote'],
    visit(node) {
      return toCallout(node) ?? undefined;
    },
  },
};
