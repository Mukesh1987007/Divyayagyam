const fs = require('fs');
const path = require('path');

function fixFinalErrors(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(file)) {
        fixFinalErrors(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Fix: / aria-label="Input field"> -> />
      if (content.includes('/ aria-label="Input field">')) {
        content = content.replace(/\/\s*aria-label="Input field">/g, '/>');
        modified = true;
      }

      // Fix: onClick={() = aria-label="Button">  -> onClick={() =>
      if (content.includes('onClick={() = aria-label="Button">')) {
        content = content.replace(/onClick=\{\(\)\s*=\s*aria-label="Button">\s*/g, 'onClick={() => ');
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed aria-label injection in: ${fullPath}`);
      }
    }
  }
}

fixFinalErrors(path.join(process.cwd(), 'app'));
fixFinalErrors(path.join(process.cwd(), 'components'));
