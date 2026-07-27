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

    // Remove the cache-control injections completely, because they break inline if-statements and are inappropriate for POST/error responses.
    
    // Pattern 1: `return NextResponse.json(...); \n response.headers.set(...); \n return response;`
    content = content.replace(/return (NextResponse\.json\([^]*?\);?)\s*response\.headers\.set\('Cache-Control',\s*'s-maxage=60,\s*stale-while-revalidate=120'\);\s*return response;?/g, "return $1");
    
    // Pattern 2: `const response = NextResponse.json(...); \n response.headers.set(...); \n return response;`
    content = content.replace(/const response = (NextResponse\.json\([^]*?\);?)\s*response\.headers\.set\('Cache-Control',\s*'s-maxage=60,\s*stale-while-revalidate=120'\);\s*return response;?/g, "return $1");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        filesModified++;
        console.log("Fixed: " + file);
    }
}
console.log("Total files modified: " + filesModified);
