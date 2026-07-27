const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('C:\\Users\\lk\\OneDrive\\Desktop\\801\\app\\api');

let filesModified = 0;
for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/\s*skip,\s*take: limit,/g, "");
    
    // Also remove duplicated properties in objects (e.g. multiple `page` or `limit` properties).
    // The typescript error showed: "An object literal cannot have multiple properties with the same name."
    // Let's see what those look like later, if this regex doesn't solve it.

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        filesModified++;
        console.log("Fixed: " + file);
    }
}
console.log("Total files modified: " + filesModified);
