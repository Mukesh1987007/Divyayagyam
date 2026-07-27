const fs = require('fs');
const path = require('path');

console.log('--- TEST ENV SCRIPT ---');
console.log('process.cwd():', process.cwd());
console.log('__dirname:', __dirname);

const searchPaths = [
  path.join(process.cwd(), '.env'),
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '../..', '.env'),
];

for (const p of searchPaths) {
  console.log(`Checking path: ${p} - Exists: ${fs.existsSync(p)}`);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf-8');
    console.log('File Content (first 100 chars):');
    console.log(content.slice(0, 200));
    break;
  }
}
