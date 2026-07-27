const fs = require('fs');
const path = require('path');

function fixEnvQuotes(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(file)) {
        fixEnvQuotes(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Fix: 'process.env.NEXT_PUBLIC_URL_1234 || ''' -> process.env.NEXT_PUBLIC_URL_1234 || ''
      if (content.match(/['"]process\.env\.[A-Z0-9_]+\s*\|\|\s*['"]['"]['"]/)) {
         content = content.replace(/['"](process\.env\.[A-Z0-9_]+\s*\|\|\s*['"][^'"]*['"])['"]/g, '$1');
         modified = true;
      }
      
      // Fix: 'process.env.NEXT_PUBLIC_URL_1234 || ""' -> process.env.NEXT_PUBLIC_URL_1234 || ""
      if (content.match(/['"](process\.env\.[A-Z0-9_]+\s*\|\|\s*['"][^'"]*['"])['"]/)) {
          content = content.replace(/['"](process\.env\.[A-Z0-9_]+\s*\|\|\s*['"][^'"]*['"])['"]/g, '$1');
          modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed quotes in: ${fullPath}`);
      }
    }
  }
}

fixEnvQuotes(path.join(process.cwd(), 'app'));
fixEnvQuotes(path.join(process.cwd(), 'components'));
fixEnvQuotes(path.join(process.cwd(), 'lib'));
