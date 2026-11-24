import { optimize } from 'svgo';

// Relative-coordinate conversion changes Chromium rasterization for these detailed outlines even
// without rounding. Keep their original path commands; formatting is still optimized.
const preserveCommands = new Set([
  'trait-stoic', 'trait-fierce', 'trait-brooding', 'trait-charismatic', 'trait-introverted',
  'trait-calm', 'faction-neutral', 'faction-villain',
  'anthro-body-muscular', 'anthro-body-petite', 'anthro-height-very-tall', 'body-average', 'figure-small', 'captions', 'trait-bold',
]);

export function optimizeIconSprite(symbols) {
  const optimized = symbols.map(symbol => {
    const name = symbol.match(/<symbol id="([^"]+)"/)?.[1];
    if (!name) throw new Error('Icon symbol has no public ID');
    const plugins = ['removeComments', 'cleanupAttrs'];
    if (!preserveCommands.has(name)) plugins.push({
      name: 'convertPathData',
      params: {
        floatPrecision: 8,
        applyTransforms: false,
        makeArcs: false,
        straightCurves: false,
        convertToQ: false,
        convertToZ: false,
        curveSmoothShorthands: false,
        removeUseless: false,
        collapseRepeated: false,
      },
    });
    // No default preset: public IDs, viewBoxes, currentColor and CSS stroke tokens are contracts.
    const result = optimize(`<svg xmlns="http://www.w3.org/2000/svg">${symbol}</svg>`, { plugins }).data;
    return result.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  });
  return `<svg xmlns="http://www.w3.org/2000/svg">${optimized.join('')}</svg>
`;
}
