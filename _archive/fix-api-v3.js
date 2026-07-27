const fs = require('fs');
const path = require('path');

function fixAPI(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixAPI(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Fix coupons
      if (content.includes('Maybe duplicate code);')) {
        content = content.replace(/const response = NextResponse\.json\(\{ ok: false, error: err\?\.message \|\| 'Failed to create coupon \(Maybe duplicate code\);\s*response\.headers\.set\('Cache-Control', 's-maxage=60, stale-while-revalidate=120'\);\s*return response;' \}, \{ status: 500 \}\)/g, 
        `return NextResponse.json({ ok: false, error: err?.message || 'Failed to create coupon (Maybe duplicate code)' }, { status: 500 })`);
        modified = true;
      }
      
      // Fix broadcast
      if (content.includes("phone: d.phone || 'No phone'")) {
        content = content.replace(/phone: d\.phone \|\| 'No phone'\s*}\);\s*response\.headers\.set\('Cache-Control', 's-maxage=60, stale-while-revalidate=120'\);\s*return response;\)/g, 
        `phone: d.phone || 'No phone'\n        })\n      }`);
        modified = true;
      }
      
      // Fix csv
      if (content.includes("phone: r.phone || r.mobile || r.whatsapp || 'No Phone'")) {
        content = content.replace(/phone: r\.phone \|\| r\.mobile \|\| r\.whatsapp \|\| 'No Phone'\s*}\);\s*response\.headers\.set\('Cache-Control', 's-maxage=60, stale-while-revalidate=120'\);\s*return response;\)/g, 
        `phone: r.phone || r.mobile || r.whatsapp || 'No Phone'\n        })\n      }`);
        modified = true;
      }

      // Fix bookings
      if (content.includes("response.headers.set('Cache-Control'")) {
        content = content.replace(/response\.headers\.set\('Cache-Control', 's-maxage=60, stale-while-revalidate=120'\);\s*return response;\s*const { searchParams } = new URL\(req\.url\);/g, 
        `const { searchParams } = new URL(req.url);`);
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed API route: ${fullPath}`);
      }
    }
  }
}

fixAPI(path.join(process.cwd(), 'app', 'api'));
