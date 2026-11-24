// Where the reference files the port follows live on disk. design.json pins one version of them by hash; they sit in a git-ignored
// .design/ folder, loaded by scripts/design-load.mjs and checked by `npm run design:fetch`. Every script, story and check reads
// them through here or the `@design` alias, so a version move changes design.json and nothing else.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const design = JSON.parse(readFileSync(join(root, 'design.json'), 'utf8'));
export const designDir = join(root, '.design');
/** Where the reference files of each version are kept (`v<version>/`), outside this repository: the folder SAKUGA_DESIGN_DIR names,
 *  or none, and then .design/ is used as it is. */
export const referenceDir = process.env.SAKUGA_DESIGN_DIR ? resolve(process.env.SAKUGA_DESIGN_DIR) : null;

/** Whether .design/ holds the files design.json pins (by presence; `npm run design:fetch` checks their hashes). */
export const hasDesign = () => existsSync(join(designDir, 'bundle.js'));

/** For a script that only makes sense against the reference files: without them it says so and stops, successfully. */
export function skipWithoutDesign(what) {
  if (hasDesign()) return;
  console.log(`${what} skipped: the reference files are not distributed with this repository, and none were found. Everything else runs without them.`);
  process.exit(0);
}

/** A design file's path, failing with the way to get it when it has not been fetched. */
export function designFile(path) {
  const file = join(designDir, path);
  if (!existsSync(file)) throw new Error(`.design/${path} is missing: the reference files are not distributed with this repository`);
  return file;
}

export function readDesign(path) {
  return readFileSync(designFile(path), 'utf8');
}
