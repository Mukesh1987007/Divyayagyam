const fs = require('fs');
const path = require('path');

console.log('🤖 [Robot 3] Running Dead-Link & Asset Checker...');

const publicDir = path.join(process.cwd(), 'public');
let publicFiles = new Set();

function getPublicFiles(dir, baseDir = '') {
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const relPath = path.join(baseDir, file).replace(/\\/g, '/');
    if (fs.statSync(fullPath).isDirectory()) {
      getPublicFiles(fullPath, relPath);
    } else {
      publicFiles.add('/' + relPath);
    }
  }
}

getPublicFiles(publicDir);

let brokenAssets = 0;

function checkCodebase(dir) {
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (['node_modules', '.next', '.git', 'public'].includes(file)) continue;
      checkCodebase(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Regex to find src="/something.jpg" or href="/something.png"
      const matches = content.match(/(src|href)=["'](\/[a-zA-Z0-9_.\-/]+\.(png|jpg|jpeg|svg|webp|gif))["']/gi);
      
      if (matches) {
        for (const match of matches) {
          const url = match.split(/["']/)[1];
          if (!publicFiles.has(url)) {
            console.warn(`❌ Broken Asset found in ${file}: ${url}`);
            brokenAssets++;
          }
        }
      }
    }
  }
}

checkCodebase(process.cwd());

if (brokenAssets > 0) {
  console.log(`\n⚠️ Warning: Found ${brokenAssets} broken asset links in the codebase.`);
  console.log(`Please make sure the images exist in the public/ folder.`);
} else {
  console.log('✅ All internal static assets are intact.');
}
