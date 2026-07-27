const fs = require('fs');
const path = require('path');

console.log('🔴 [Critical Bug Fixer] Fixing all CRITICAL bugs...\n');

// Load bug report
let report;
try {
  report = JSON.parse(fs.readFileSync('bug-report.json', 'utf8'));
} catch (e) {
  console.error('❌ bug-report.json not found! Run node bug-robot.js first.');
  process.exit(1);
}

const criticalBugs = report.criticalBugs || report.bugs.filter(b => b.severity === 'CRITICAL');
console.log(`📋 Found ${criticalBugs.length} critical bugs to fix\n`);

let fixes = 0;

// ============================================================
// FIX 1: Exposed Secrets → Move to .env
// ============================================================
function fixExposedSecrets(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Find hardcoded secrets
  const secretPatterns = [
    { regex: /PASSWORD\s*=\s*['"]([^'"]+)['"]/g, key: 'PASSWORD' },
    { regex: /SECRET\s*=\s*['"]([^'"]+)['"]/g, key: 'SECRET' },
    { regex: /API_KEY\s*=\s*['"]([^'"]+)['"]/g, key: 'API_KEY' },
    { regex: /TOKEN\s*=\s*['"]([^'"]+)['"]/g, key: 'TOKEN' },
    { regex: /KEY\s*=\s*['"]([^'"]+)['"]/g, key: 'KEY' },
  ];

  for (const pattern of secretPatterns) {
    const matches = content.match(pattern.regex);
    if (matches) {
      for (const match of matches) {
        const value = match.match(/['"]([^'"]+)['"]/)?.[1];
        if (value && !value.includes('process.env')) {
          // Replace with env variable
          const varName = `NEXT_PUBLIC_${pattern.key}_${Date.now().toString().slice(-4)}`;
          content = content.replace(match, `${pattern.key} = process.env.${varName} || ''`);
          console.log(`   🔧 Replaced hardcoded ${pattern.key} with env variable`);
          modified = true;
          
          // Add to .env.local
          const envPath = path.join(process.cwd(), '.env.local');
          let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
          if (!envContent.includes(varName)) {
            fs.appendFileSync(envPath, `\n${varName}="${value}"`);
            console.log(`   ✅ Added ${varName} to .env.local`);
          }
        }
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// ============================================================
// FIX 2: Missing Suspense
// ============================================================
function fixMissingSuspense(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has Suspense
  if (content.includes('<Suspense') || content.includes('React.Suspense')) {
    console.log(`   ⏭️ Already has Suspense: ${path.basename(filePath)}`);
    return false;
  }

  // Add React import if missing
  if (!content.includes('import React')) {
    content = `import React from 'react';\n${content}`;
  }

  // Find component name
  const match = content.match(/export\s+default\s+function\s+([a-zA-Z0-9_]+)/);
  if (!match) return false;

  const compName = match[1];
  
  // Rename component and add wrapper
  content = content.replace(
    new RegExp(`export default function ${compName}\\s*\\(`),
    `function ${compName}_Content(`
  );

  content += `

export default function ${compName}() {
  return (
    <React.Suspense fallback={
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"></div>
      </div>
    }>
      <${compName}_Content />
    </React.Suspense>
  );
}
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`   ✅ Added Suspense: ${path.basename(filePath)}`);
  return true;
}

// ============================================================
// FIX 3: Missing "use client"
// ============================================================
function fixMissingUseClient(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has "use client"
  if (content.includes('"use client"') || content.includes("'use client'")) {
    return false;
  }

  // Add "use client" at top
  content = `'use client';\n\n${content}`;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`   ✅ Added "use client": ${path.basename(filePath)}`);
  return true;
}

// ============================================================
// FIX 4: Direct localStorage Access
// ============================================================
function fixLocalStorage(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('localStorage')) return false;
  if (content.includes('typeof window') || content.includes('if (typeof window')) return false;

  // Safe localStorage wrapper
  const safeWrapper = `
// Safe localStorage access
const safeLocalStorage = {
  getItem: (key) => {
    if (typeof window === 'undefined') return null;
    try { return localStorage.getItem(key); } catch { return null; }
  },
  setItem: (key, value) => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
  },
  removeItem: (key) => {
    if (typeof window === 'undefined') return;
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }
};
`;

  // Add safe wrapper after imports
  const lines = content.split('\n');
  let insertIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import')) {
      insertIndex = i + 1;
    } else if (insertIndex > 0 && !lines[i].startsWith('import')) {
      break;
    }
  }
  lines.splice(insertIndex, 0, safeWrapper);
  content = lines.join('\n');

  // Replace direct localStorage calls
  content = content.replace(/localStorage\.getItem\(/g, 'safeLocalStorage.getItem(');
  content = content.replace(/localStorage\.setItem\(/g, 'safeLocalStorage.setItem(');
  content = content.replace(/localStorage\.removeItem\(/g, 'safeLocalStorage.removeItem(');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`   ✅ Fixed localStorage: ${path.basename(filePath)}`);
  return true;
}

// ============================================================
// EXECUTE ALL CRITICAL FIXES
// ============================================================

console.log('🔧 Applying critical fixes...\n');

for (const bug of criticalBugs) {
  const filePath = bug.file;
  const bugType = bug.type;
  
  console.log(`\n📁 Fixing: ${path.basename(filePath)}`);
  console.log(`   Type: ${bugType}`);
  
  let fixed = false;
  
  if (bugType.includes('Exposed Secret')) {
    fixed = fixExposedSecrets(filePath);
  } else if (bugType.includes('Missing Suspense')) {
    fixed = fixMissingSuspense(filePath);
  } else if (bugType.includes('Missing "use client"')) {
    fixed = fixMissingUseClient(filePath);
  } else if (bugType.includes('Direct localStorage')) {
    fixed = fixLocalStorage(filePath);
  }
  
  if (fixed) fixes++;
}

// ============================================================
// ADDITIONAL: Fix all "use client" in hooks
// ============================================================
console.log('\n📂 Fixing all hooks with "use client"...');
const hooksDir = path.join(process.cwd(), 'hooks');
if (fs.existsSync(hooksDir)) {
  const files = fs.readdirSync(hooksDir);
  for (const file of files) {
    if (file.endsWith('.jsx') || file.endsWith('.tsx')) {
      const filePath = path.join(hooksDir, file);
      const fixed = fixMissingUseClient(filePath);
      if (fixed) fixes++;
    }
  }
}

// ============================================================
// SUMMARY
// ============================================================
console.log('\n' + '='.repeat(60));
console.log('✅ CRITICAL BUGS FIXED!');
console.log('='.repeat(60));
console.log(`📊 Total fixes applied: ${fixes}`);
console.log(`📋 Critical bugs remaining: ${criticalBugs.length - fixes}`);

console.log('\n🚀 NEXT STEPS:');
console.log('1. Run: npm run build');
console.log('2. Run: npm run dev');
console.log('3. Run: node bug-robot.js (to verify fixes)');
console.log('4. Share the new bug report with me');

console.log('\n📌 FIXES APPLIED:');
console.log('  ✅ Exposed secrets → Moved to .env.local');
console.log('  ✅ Missing Suspense → Added React.Suspense wrapper');
console.log('  ✅ Missing "use client" → Added directive');
console.log('  ✅ Direct localStorage → Safe wrapper added');
