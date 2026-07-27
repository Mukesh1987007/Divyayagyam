const fs = require('fs');
const path = require('path');

console.log('🔧 [Auto-Fix] Fixing Critical Issues...\n');

// Load robot report
let report;
try {
  report = JSON.parse(fs.readFileSync('robot-report.json', 'utf8'));
} catch (e) {
  console.error('❌ robot-report.json not found! Run node auto-robot.js first.');
  process.exit(1);
}

const criticalIssues = report.issues.filter(i => i.type === 'CRITICAL');
console.log(`📋 Found ${criticalIssues.length} critical issues to fix\n`);

let fixed = 0;

// ============================================================
// FIX 1: Add Suspense to useSearchParams pages
// ============================================================
function fixSuspense(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has Suspense
  if (content.includes('<Suspense') || content.includes('React.Suspense')) {
    console.log(`✅ Already has Suspense: ${path.basename(filePath)}`);
    return false;
  }

  // Find component name
  const match = content.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
  if (!match) {
    console.log(`⚠️ Could not find component name in: ${filePath}`);
    return false;
  }

  const compName = match[1];
  console.log(`🔧 Fixing: ${path.basename(filePath)} (component: ${compName})`);

  // Add React import if missing
  if (!content.includes('import React')) {
    content = `import React from 'react';\n${content}`;
  }

  // Check if there's already a default export
  const defaultExportMatch = content.match(/export default function\s+([a-zA-Z0-9_]+)/);
  if (defaultExportMatch) {
    // Already has default export, rename and wrap
    const oldExportName = defaultExportMatch[1];
    
    // Rename component
    content = content.replace(
      new RegExp(`export default function ${oldExportName}\\s*\\(`),
      `function ${oldExportName}_Content(`
    );
    
    // Add wrapped export
    content += `

export default function ${oldExportName}() {
  return (
    <React.Suspense fallback={
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"></div>
      </div>
    }>
      <${oldExportName}_Content />
    </React.Suspense>
  );
}
`;
  } else {
    // No default export, create one
    content += `

export default function ${compName}Page() {
  return (
    <React.Suspense fallback={
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"></div>
      </div>
    }>
      <${compName} />
    </React.Suspense>
  );
}
`;
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed: ${path.basename(filePath)}`);
  return true;
}

// ============================================================
// FIX 2: Add "use client" to all client components
// ============================================================
function fixUseClient(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has "use client"
  if (content.includes('"use client"') || content.includes("'use client'")) {
    return false;
  }
  
  // Check if it needs "use client"
  const needsClient = 
    content.includes('useState') ||
    content.includes('useEffect') ||
    content.includes('useRef') ||
    content.includes('useContext') ||
    content.includes('onClick') ||
    content.includes('onChange') ||
    content.includes('@radix-ui');
  
  if (!needsClient) return false;
  
  // Remove BOM if present
  content = content.replace(/^\uFEFF/, '');
  
  // Add "use client" at top
  content = `'use client';\n\n${content}`;
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Added "use client": ${path.basename(filePath)}`);
  return true;
}

// ============================================================
// FIX 3: Add Cache-Control headers to APIs
// ============================================================
function fixAPICache(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('NextResponse.json')) return false;
  if (content.includes('Cache-Control')) return false;
  
  // Find response creation and add headers
  let fixApplied = false;
  content = content.replace(
    /return\s+NextResponse\.json\(([^)]+)\)/g,
    (match, args) => {
      fixApplied = true;
      return `const response = NextResponse.json(${args});
  response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  return response;`;
    }
  );
  
  if (fixApplied) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Added Cache-Control: ${path.basename(path.dirname(filePath))}/route.ts`);
    return true;
  }
  return false;
}

// ============================================================
// EXECUTE FIXES
// ============================================================

console.log('📂 Fixing Critical Issues...\n');

// 1. Fix Suspense (Critical)
for (const issue of criticalIssues) {
  if (issue.issue.includes('useSearchParams')) {
    const isFixed = fixSuspense(issue.file);
    if (isFixed) fixed++;
  }
}

// 2. Fix "use client" in all files
console.log('\n📂 Adding "use client" where needed...');
const allFiles = scanFiles('components');
const uiFiles = scanFiles('components/ui');
const allComponents = [...allFiles, ...uiFiles];

for (const file of allComponents) {
  const isFixed = fixUseClient(file);
  if (isFixed) fixed++;
}

// 3. Fix API cache headers
console.log('\n📂 Adding Cache-Control to APIs...');
const apiFiles = scanFiles('app/api');
for (const file of apiFiles) {
  if (file.endsWith('route.ts') || file.endsWith('route.js')) {
    const isFixed = fixAPICache(file);
    if (isFixed) fixed++;
  }
}

// ============================================================
// HELPER: Scan files
// ============================================================
function scanFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(file)) continue;
      scanFiles(fullPath, results);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.js')) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

// ============================================================
// SUMMARY
// ============================================================
console.log('\n' + '='.repeat(50));
console.log('✅ CRITICAL FIXES COMPLETE!');
console.log('='.repeat(50));
console.log(`📊 Total fixes applied: ${fixed}`);
console.log('\n🚀 NEXT STEPS:');
console.log('1. Run: npm run build');
console.log('2. Run: npm run dev');
console.log('3. Run: node auto-robot.js (to verify fixes)');
console.log('4. Share the new report with me for further optimization');
console.log('\n📌 Remaining issues will be fixed in Phase 2!');
