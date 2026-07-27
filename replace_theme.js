const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFiles(dirs) {
  dirs.forEach(dir => {
    walkDir(dir, (filePath) => {
      if (filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        let newContent = content;
        if (newContent.includes('orange-600')) {
          newContent = newContent.replace(/text-orange-600/g, 'text-[var(--primary-color)]');
          newContent = newContent.replace(/bg-orange-600/g, 'bg-[var(--primary-color)]');
          newContent = newContent.replace(/border-orange-600/g, 'border-[var(--primary-color)]');
          changed = true;
        }
        if (newContent.includes('orange-500')) {
          newContent = newContent.replace(/text-orange-500/g, 'text-[var(--primary-color)]');
          newContent = newContent.replace(/bg-orange-500/g, 'bg-[var(--primary-color)]');
          newContent = newContent.replace(/border-orange-500/g, 'border-[var(--primary-color)]');
          changed = true;
        }
        if (newContent.includes('orange-50')) {
          newContent = newContent.replace(/bg-orange-50/g, 'bg-[var(--secondary-color)]/10');
          changed = true;
        }
        if (newContent.includes('amber-100')) {
          newContent = newContent.replace(/amber-100/g, 'gray-100');
          changed = true;
        }
        if (newContent.includes('#E56910')) {
          newContent = newContent.replace(/#E56910/g, 'var(--primary-color)');
          changed = true;
        }
        
        if (changed && newContent !== content) {
          fs.writeFileSync(filePath, newContent);
          console.log('Updated', filePath);
        }
      }
    });
  });
}

processFiles(['app/(marketing)', 'components']);
