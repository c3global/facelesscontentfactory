// One command for a new member: node tools/setup.mjs "<new project folder>"
// Creates the project folder (if it does not exist yet), then installs and tests everything inside it.
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const target = process.argv[2];
if (!target) {
  console.error('Usage: node tools/setup.mjs "<new project folder>"   (for example: ~/Faceless48 Videos)');
  process.exit(1);
}
const dir = path.resolve(target);
if (!existsSync(path.join(dir, 'package.json'))) {
  const c = spawnSync(process.execPath, [path.join(here, 'create-project.mjs'), dir], {stdio: 'inherit'});
  if (c.status !== 0) process.exit(c.status ?? 1);
}
const r = spawnSync(process.execPath, [path.join(dir, 'scripts', 'setup.mjs'), ...process.argv.slice(3)], {stdio: 'inherit', cwd: dir});
process.exit(r.status ?? 1);
