const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file === 'route.ts') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Look for catch blocks that don't already have P2003
      if (content.includes('prisma.') && content.includes('.delete') && content.includes('catch (err: any)') && !content.includes("err.code === 'P2003'")) {
        const replaceRegex = /catch\s*\(\s*err:\s*any\s*\)\s*\{\n\s*(?:console\.error[^\n]+\n\s*)?return\s*NextResponse\.json/g;
        
        const newContent = content.replace(replaceRegex, `catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 })
    }
    return NextResponse.json`);
        
        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log(`Patched ${fullPath}`);
        }
      }
    }
  }
}

processDir('c:\\Users\\lk\\OneDrive\\Desktop\\801\\app\\api');
console.log('Done!');
