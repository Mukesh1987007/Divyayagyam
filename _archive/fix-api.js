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
      if (content.includes('if (!session) const response =')) {
        content = content.replace(/if \(!session\) const response =/g, 'if (!session) return');
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
