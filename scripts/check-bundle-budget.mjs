import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const html = readFileSync(new URL('index.html', dist), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map((match) => match[1]);
const limit = 200 * 1024;
let total = 0;

for (const ref of refs) {
  const file = join(dist.pathname, ref.replace(/^\//, ''));
  const size = gzipSync(readFileSync(file)).length;
  total += size;
  console.log(`${ref}  ${(size / 1024).toFixed(1)} kB gzip`);
}

console.log(`Chemin critique : ${(total / 1024).toFixed(1)} kB gzip (budget 200 kB)`);
if (total > limit) {
  console.error('Le chemin critique dépasse 200 kB gzip.');
  process.exit(1);
}
