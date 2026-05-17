const fs = require('node:fs');
const path = require('node:path');

const source = path.join(__dirname, '..', 'public', 'index.html');
const outDir = path.join(__dirname, '..', 'dist');
const destination = path.join(outDir, 'index.html');

fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(source, destination);
console.log('Build complete: dist/index.html');
