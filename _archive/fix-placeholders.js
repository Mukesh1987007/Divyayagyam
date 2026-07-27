const fs = require('fs');
const path = require('path');

function fixPlaceholders(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(file)) {
        fixPlaceholders(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Fix missing brackets on placeholder: placeholder=process.env... || ''
      if (content.match(/\splaceholder=process\.env\.[A-Z0-9_]+\s*\|\|\s*['"][^'"]*['"]/g)) {
        content = content.replace(/\splaceholder=(process\.env\.[A-Z0-9_]+\s*\|\|\s*['"][^'"]*['"])/g, ' placeholder={$1}');
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed JSX braces in: ${fullPath}`);
      }
    }
  }
}

fixPlaceholders(path.join(process.cwd(), 'app'));
