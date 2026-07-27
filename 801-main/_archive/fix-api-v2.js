const fs = require('fs');
const path = require('path');

function fixAPI(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixAPI(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Fix if (!session) const response = ...
      if (content.match(/if \(![a-zA-Z0-9_]+\) const response =/)) {
        content = content.replace(/if \(!([a-zA-Z0-9_]+)\) const response =/g, 'if (!$1) return');
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed API route: ${fullPath}`);
      }
    }
  }
}

fixAPI(path.join(process.cwd(), 'app', 'api'));
