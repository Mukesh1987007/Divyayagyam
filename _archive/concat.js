const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\Jai Shree Krishna\\Desktop\\55\\801-main';
const outputFile = path.join(rootDir, 'all_project_code.txt');

const excludeDirs = new Set(['.git', 'node_modules', '.next', '.emergent', 'memory', 'test_reports']);
const excludeExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.lock']);
const excludeFiles = new Set(['package-lock.json', 'yarn.lock', 'all_project_code.txt', 'concat.py', 'concat.js']);

let outStream = fs.createWriteStream(outputFile, { flags: 'w', encoding: 'utf-8' });

function walkDir(currentPath) {
    let entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (let entry of entries) {
        if (entry.isDirectory()) {
            if (!excludeDirs.has(entry.name)) {
                walkDir(path.join(currentPath, entry.name));
            }
        } else if (entry.isFile()) {
            if (excludeFiles.has(entry.name)) continue;
            
            let ext = path.extname(entry.name).toLowerCase();
            if (excludeExts.has(ext)) continue;
            
            let filePath = path.join(currentPath, entry.name);
            let relPath = path.relative(rootDir, filePath);
            
            try {
                let content = fs.readFileSync(filePath, 'utf-8');
                outStream.write(`\n\n================================================================================\n`);
                outStream.write(`File: ${relPath}\n`);
                outStream.write(`================================================================================\n\n`);
                outStream.write(content);
            } catch (err) {
                console.error(`Skipping ${filePath}: ${err.message}`);
            }
        }
    }
}

walkDir(rootDir);
outStream.end();
console.log('Done!');
