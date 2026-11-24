// `node scripts/need-design.mjs [--dev] <command> [args]`: runs the command only when the reference files are in .design/. The reference
// files are not distributed with this repository; without them a test run is skipped with a message and succeeds, and a dev server
// (--dev) stops with the message, since there is nothing to serve.
import { spawnSync } from 'node:child_process';
import { hasDesign } from './design.mjs';

const args = process.argv.slice(2);
const dev = args[0] === '--dev';
if (dev) args.shift();
if (!hasDesign()) {
  console.log(`${args.slice(0, 2).join(' ')} skipped: the reference files are not distributed with this repository, and none were found.`);
  process.exit(dev ? 1 : 0);
}
process.exit(spawnSync(args[0], args.slice(1), { stdio: 'inherit' }).status ?? 1);
