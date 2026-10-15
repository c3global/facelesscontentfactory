#!/usr/bin/env node
/**
 * Synthesizes the effect sound kit into public/sfx/fx-*.wav (see scripts/make-sfx.py for how each sound is made).
 *   npm run sfx        (needs python3 with numpy and scipy)
 */
import {execFileSync} from 'node:child_process';
import path from 'node:path';

execFileSync('python3', [path.join(process.cwd(), 'scripts', 'make-sfx.py')], {stdio: 'inherit', cwd: process.cwd()});
