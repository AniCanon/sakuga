// Makes .design/ hold the reference version design.json pins, and checks it file by file against its hashes. The reference files are
// not distributed with this repository: when the folder SAKUGA_DESIGN_DIR names holds them (<dir>/v<version>/) they are copied
// into the git-ignored .design/; when neither exists, this says so and stops without failing, so everything else still runs.
// Nothing is downloaded or uploaded. Run before anything that reads the reference files.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { design, designDir, referenceDir } from './design.mjs';

const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const bad = () => Object.entries(design.sha256).filter(([path, want]) => !existsSync(join(designDir, path)) || sha(join(designDir, path)) !== want);

if (bad().length) {
  const from = referenceDir && join(referenceDir, `v${design.version}`);
  if (from && existsSync(from)) {
    rmSync(designDir, { recursive: true, force: true });
    cpSync(from, designDir, { recursive: true });
  } else if (!existsSync(designDir)) {
    console.log(`Reference files for version ${design.version} are not available here (they are not distributed with this repository), so the checks that compare against them are skipped.`);
    process.exit(0);
  }
  const still = bad();
  if (still.length) {
    console.error(`.design/ does not hold version ${design.version}: ${still.map(([path]) => path).join(', ')} differ from design.json.`);
    process.exit(1);
  }
}
