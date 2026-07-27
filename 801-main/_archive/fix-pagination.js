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

    content = content.replace(/\s*skip: \(page - 1\) \* limit,\s*take: limit,/g, "");

    content = content.replace(/\s*const { searchParams } = new URL\(req\.url\);\s*const page = parseInt\(searchParams\.get\('page'\) \|\| '1'\);\s*const limit = parseInt\(searchParams\.get\('limit'\) \|\| '20'\);\s*const skip = \(page - 1\) \* limit;/g, "");

    // Let's also remove where we saw: const { searchParams } = new URL(req.url)\n    const page = Math.max(1, parseInt(searchParams.get('page') || '1')) ... wait no, we only want to remove the exact injected one that redeclares page/limit.

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        filesModified++;
        console.log("Fixed: " + file);
    }
}
console.log("Total files modified: " + filesModified);
