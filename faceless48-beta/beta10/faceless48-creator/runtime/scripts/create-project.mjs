import {cpSync,existsSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=path.resolve(process.argv[2]||'');
if(!process.argv[2]||existsSync(target))throw Error('Provide a NEW project directory. Existing folders are never overwritten.');
mkdirSync(target,{recursive:true});
cpSync(source,target,{recursive:true,filter:p=>!['node_modules','out','whisper.cpp','.stock-cache','stock-keys.json'].includes(path.basename(p))});
console.log(`Created ${target}. Run npm ci there, then npm run f48 -- doctor. Configure brand.json, add media under public/, and ask your agent to follow the production skill.`);
