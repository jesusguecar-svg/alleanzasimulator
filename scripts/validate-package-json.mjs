import { readFile } from 'node:fs/promises';

const packageJson = await readFile(new URL('../package.json', import.meta.url), 'utf8');
JSON.parse(packageJson);
console.log('package.json is valid JSON');
