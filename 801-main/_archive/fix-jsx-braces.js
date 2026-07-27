const fs = require('fs');
const path = require('path');

function fixJSX(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(file)) {
        fixJSX(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Fix missing brackets on href/src: href=process.env... || ''
      if (content.match(/\s(href|src)=process\.env\.[A-Z0-9_]+\s*\|\|\s*['"][^'"]*['"]/g)) {
        content = content.replace(/\s(href|src)=(process\.env\.[A-Z0-9_]+\s*\|\|\s*['"][^'"]*['"])/g, ' $1={$2}');
        modified = true;
      }

      // Fix bare inner process.env in JSX: >process.env... || ''<
      if (content.match(/>process\.env\.[A-Z0-9_]+\s*\|\|\s*['"][^'"]*['"]</g)) {
        content = content.replace(/>(process\.env\.[A-Z0-9_]+\s*\|\|\s*['"][^'"]*['"])</g, '>{$1}<');
        modified = true;
      }

      // Fix temples unclosed backtick: `process.env... || ''
      if (content.match(/`process\.env\.NEXT_PUBLIC_URL_\d+\s*\|\|\s*''\s*$/m)) {
         content = content.replace(/`process\.env\.NEXT_PUBLIC_URL_\d+\s*\|\|\s*''\s*$/m, '`https://www.youtube.com/embed/${match[1]}`');
         modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed JSX braces in: ${fullPath}`);
      }
    }
  }
}

fixJSX(path.join(process.cwd(), 'app'));
fixJSX(path.join(process.cwd(), 'components'));
fixJSX(path.join(process.cwd(), 'lib'));
