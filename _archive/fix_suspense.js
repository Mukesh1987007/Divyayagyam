const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.tsx') && file.includes('page.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./app');
// Also add app/bookings/new/page.tsx etc that we found

let changed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('useSearchParams') && content.includes('use client') && !content.includes('<React.Suspense') && !content.includes('<Suspense')) {
    
    if (!content.includes('import React')) {
      content = "import React from 'react';\n" + content;
    }
    
    const match = content.match(/export default function ([a-zA-Z0-9_]+)/);
    if (match) {
      const componentName = match[1];
      
      content = content.replace(
        new RegExp('export default function ' + componentName + '\\s*\\('), 
        'function ' + componentName + '_Content('
      );
      
      content += '\n\n' +
        'export default function ' + componentName + '() {\n' +
        '  return (\n' +
        '    <React.Suspense fallback={<div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#FF8C21]"></div></div>}>\n' +
        '      <' + componentName + '_Content />\n' +
        '    </React.Suspense>\n' +
        '  )\n' +
        '}\n';
        
      fs.writeFileSync(file, content, 'utf8');
      changed++;
      console.log('Fixed', file);
    }
  }
});

console.log('Total files fixed:', changed);
