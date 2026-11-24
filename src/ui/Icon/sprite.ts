/* Where Icon's <use> points. The icons are one file the browser downloads once and caches, so no page carries their drawings in
   its script. Empty means the sprite is inlined in the page and each icon points at its own id. */
let spriteUrl = '';

export function setIconSprite(url: string): void {
  spriteUrl = url;
}

export function iconHref(name: string): string {
  return `${spriteUrl}#${name}`;
}
