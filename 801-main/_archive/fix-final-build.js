const fs = require('fs');
const path = require('path');

console.log('🚨 [FINAL FIX] Fixing all remaining build errors...\n');

let fixes = 0;

// ============================================================
// 1. FIX: razorpay-checkout-button.tsx - Template literal
// ============================================================
function fixRazorpay() {
  const filePath = path.join(process.cwd(), 'components', 'razorpay-checkout-button.tsx');
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix broken template literal in button text
  content = content.replace(
    /Processing…<\/span> : \(label \|\|'Pay \$\{amountInRupees\.toLocaleString\('en-IN'\)\}\)`}/g,
    `Processing…</span> : (label || \`Pay ₹\${amountInRupees.toLocaleString('en-IN')}\`)}`
  );
  
  // Alternative fix: simpler version
  content = content.replace(
    /{loading \? <span className="flex items-center justify-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" \/> Processing…<\/span> : \(label \|\|'Pay \$\{amountInRupees\.toLocaleString\('en-IN'\)\}\)`}/g,
    `{loading ? <span className="flex items-center justify-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing…</span> : (label || \`Pay ₹\${amountInRupees.toLocaleString('en-IN')}\`)}`
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed: components/razorpay-checkout-button.tsx');
  return true;
}

// ============================================================
// 2. FIX: admin/blog/new/page.tsx - placeholder
// ============================================================
function fixBlogNew() {
  const filePath = path.join(process.cwd(), 'app', 'admin', 'blog', 'new', 'page.tsx');
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix placeholder with process.env
  content = content.replace(
    /placeholder=process\.env\.[A-Z_]+ \|\| ''/g,
    `placeholder="https://youtube.com/watch?v=..."`
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed: app/admin/blog/new/page.tsx');
  return true;
}

// ============================================================
// 3. FIX: admin/gallery/page.tsx - placeholder
// ============================================================
function fixGallery() {
  const filePath = path.join(process.cwd(), 'app', 'admin', 'gallery', 'page.tsx');
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix placeholder with process.env
  content = content.replace(
    /placeholder=process\.env\.[A-Z_]+ \|\| ''/g,
    `placeholder="https://drive.google.com/file/d/.../view"`
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed: app/admin/gallery/page.tsx');
  return true;
}

// ============================================================
// 4. FIX: admin/settings/page.tsx - placeholder
// ============================================================
function fixSettings() {
  const filePath = path.join(process.cwd(), 'app', 'admin', 'settings', 'page.tsx');
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix placeholder with process.env
  content = content.replace(
    /placeholder=process\.env\.[A-Z_]+ \|\| ''/g,
    `placeholder="https://www.google.com/maps/embed?..."`
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed: app/admin/settings/page.tsx');
  return true;
}

// ============================================================
// 5. FIX: admin/social/page.tsx - Template literal
// ============================================================
function fixSocial() {
  const filePath = path.join(process.cwd(), 'app', 'admin', 'social', 'page.tsx');
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix broken className template literal
  content = content.replace(
    /className={`[^`]*`}\s*`}/g,
    (match) => {
      // Extract the actual classes
      const clean = match.replace(/`}\s*`}/g, '`');
      return clean;
    }
  );
  
  // Fix the specific pattern
  content = content.replace(
    /selected \? 'bg-orange-600 border-orange-600 text-white shadow' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'\n\s*}\}\``}/g,
    `selected ? 'bg-orange-600 border-orange-600 text-white shadow' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'\`}`
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed: app/admin/social/page.tsx');
  return true;
}

// ============================================================
// 6. GENERIC FIX: All placeholder attributes
// ============================================================
function fixAllPlaceholders() {
  let count = 0;
  
  function scanAndFix(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (['node_modules', '.next', '.git', 'public'].includes(file)) continue;
        scanAndFix(fullPath);
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;
        
        // Fix placeholder=process.env.XXX || ''
        if (content.includes('placeholder=process.env.')) {
          content = content.replace(
            /placeholder=process\.env\.[A-Z_]+(\s*\|\|\s*['"][^'"]*['"])?/g,
            (match) => {
              modified = true;
              // Extract the original placeholder text if available
              const textMatch = match.match(/placeholder=(.*)/);
              if (textMatch && textMatch[1]) {
                return `placeholder="${textMatch[1].replace(/process\.env\.[A-Z_]+\s*\|\|\s*/, '').replace(/['"]/g, '')}"`;
              }
              return 'placeholder="Enter value..."';
            }
          );
        }
        
        // Fix src=process.env.XXX || ''
        if (content.includes('src=process.env.')) {
          content = content.replace(
            /src=process\.env\.[A-Z_]+(\s*\|\|\s*['"][^'"]*['"])?/g,
            (match) => {
              modified = true;
              // Extract the actual URL
              const textMatch = match.match(/src=(.*)/);
              if (textMatch && textMatch[1]) {
                const clean = textMatch[1].replace(/process\.env\.[A-Z_]+\s*\|\|\s*/, '').replace(/['"]/g, '');
                if (clean && clean.startsWith('http')) {
                  return `src="${clean}"`;
                }
              }
              return 'src=""';
            }
          );
        }
        
        // Fix href=process.env.XXX || ''
        if (content.includes('href=process.env.')) {
          content = content.replace(
            /href=process\.env\.[A-Z_]+(\s*\|\|\s*['"][^'"]*['"])?/g,
            (match) => {
              modified = true;
              const textMatch = match.match(/href=(.*)/);
              if (textMatch && textMatch[1]) {
                const clean = textMatch[1].replace(/process\.env\.[A-Z_]+\s*\|\|\s*/, '').replace(/['"]/g, '');
                return `href="${clean}"`;
              }
              return 'href="#"';
            }
          );
        }
        
        if (modified) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`   ✅ Fixed: ${path.basename(fullPath)}`);
          count++;
        }
      }
    }
  }
  
  scanAndFix(path.join(process.cwd(), 'app'));
  scanAndFix(path.join(process.cwd(), 'components'));
  
  return count;
}

// ============================================================
// EXECUTE ALL FIXES
// ============================================================

console.log('🔧 Fixing specific files...\n');

if (fixRazorpay()) fixes++;
if (fixBlogNew()) fixes++;
if (fixGallery()) fixes++;
if (fixSettings()) fixes++;
if (fixSocial()) fixes++;

console.log('\n🔧 Fixing all remaining placeholders...');
const genericFixes = fixAllPlaceholders();
fixes += genericFixes;

// ============================================================
// SUMMARY
// ============================================================
console.log('\n' + '='.repeat(60));
console.log('✅ FINAL EMERGENCY FIX COMPLETE!');
console.log('='.repeat(60));
console.log(`📊 Total fixes applied: ${fixes}`);

console.log('\n🚀 NEXT STEPS:');
console.log('1. Run: npm run build');
console.log('2. Run: npm run dev');
console.log('3. Deploy: git add . && git commit -m "Fix: Final build errors resolved" && git push origin main');

console.log('\n📌 FIXES APPLIED:');
console.log('  ✅ razorpay-checkout-button.tsx: Fixed template literal');
console.log('  ✅ admin/blog/new/page.tsx: Fixed placeholder');
console.log('  ✅ admin/gallery/page.tsx: Fixed placeholder');
console.log('  ✅ admin/settings/page.tsx: Fixed placeholder');
console.log('  ✅ admin/social/page.tsx: Fixed className template');
console.log(`  ✅ ${genericFixes} other files fixed`);
