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
        let newContent = content.replace(/bg-\[var\(--secondary-color\)\]\/10\/50/g, 'bg-[var(--secondary-color)]/10');
        
        if (newContent !== content) {
          fs.writeFileSync(filePath, newContent);
        }
      }
    });
  });
}

processFiles(['app', 'components']);
