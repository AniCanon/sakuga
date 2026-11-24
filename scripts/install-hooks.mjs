// `prepare`: points this clone's git at .githooks so the public check runs before every commit. Does nothing outside a git checkout.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

if (existsSync('.git') && existsSync('.githooks')) {
  try { execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'ignore' }); } catch { /* no git: nothing to install */ }
}
