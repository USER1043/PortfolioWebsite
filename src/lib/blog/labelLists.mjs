/**
 * @file Labelled lists. A bullet list where every item starts with a bold
 * label ending in a colon becomes a definition list, shown as the boxed
 * "why / trade-off" block on post pages:
 *
 *   - **Why:** adding a company means adding a file.
 *   - **Trade-off:** selectors still break when a site redesigns.
 *
 * Lists with any unlabelled item are left alone. A Sätteri hast plugin,
 * registered in astro.config.mjs.
 * @module lib/blog/labelLists
 */

const isBlankText = (node) => node.type === 'text' && node.value.trim() === '';
const isElement = (node, tag) => node?.type === 'element' && node.tagName === tag;

function clone(node) {
  const copy = { type: node.type };
  if (node.tagName !== undefined) copy.tagName = node.tagName;
  if (node.properties !== undefined) copy.properties = { ...node.properties };
  if (node.value !== undefined) copy.value = node.value;
  if (node.children !== undefined) copy.children = node.children.map(clone);
  return copy;
}

function textOf(node) {
  if (node.type === 'text') return node.value;
  return (node.children ?? []).map(textOf).join('');
}

// An item's inline content: tight lists hold it directly, loose lists wrap it in <p>.
function inlineChildren(li) {
  const kids = (li.children ?? []).filter((c) => !isBlankText(c));
  return kids.length === 1 && isElement(kids[0], 'p') ? kids[0].children : kids;
}

// { label, rest } for "**Why:** text", or null.
export function splitLabel(li) {
  const inline = inlineChildren(li);
  const [first] = inline;
  if (!isElement(first, 'strong')) return null;
  const raw = textOf(first).trim();
  if (!raw.endsWith(':') || raw.length < 2 || raw.length > 24) return null;

  const rest = inline.slice(1).map(clone);
  if (rest[0]?.type === 'text') {
    rest[0].value = rest[0].value.replace(/^\s+/, '');
    if (rest[0].value === '') rest.shift();
  }
  if (rest.length === 0) return null;
  return { label: raw.slice(0, -1).trim().toLowerCase(), rest };
}

export function toLabelList(ul) {
  const items = (ul.children ?? []).filter((c) => isElement(c, 'li'));
  if (items.length < 2) return null;
  const pairs = items.map(splitLabel);
  if (pairs.some((p) => p === null)) return null;

  return {
    type: 'element',
    tagName: 'dl',
    properties: { className: ['label-list'] },
    children: pairs.flatMap(({ label, rest }) => [
      { type: 'element', tagName: 'dt', properties: {}, children: [{ type: 'text', value: label }] },
      { type: 'element', tagName: 'dd', properties: {}, children: rest },
    ]),
  };
}

export const labelListsPlugin = {
  name: 'blog-label-lists',
  element: {
    filter: ['ul'],
    visit(node) {
      return toLabelList(node) ?? undefined;
    },
  },
};
