// Runs a Python script with the project's own Python (.venv), falling back to the system one.
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import path from 'node:path';

const win = process.platform === 'win32';
const venv = path.join(process.cwd(), '.venv', win ? 'Scripts/python.exe' : 'bin/python3');
const py = existsSync(venv) ? venv : win ? 'python' : 'python3';
const r = spawnSync(py, process.argv.slice(2), {stdio: 'inherit'});
if (r.error) {
  console.error('Python is not set up yet. Run: npm run setup');
  process.exit(1);
}
process.exit(r.status ?? 1);
