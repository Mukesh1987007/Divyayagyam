const fs = require('fs');
const path = require('path');

console.log('🤖 [Auto-Fix Robot] Starting full project repair...\n');

let fixesApplied = 0;

// ============================================================
// 1. FIX: Add "use client" to all UI components
// ============================================================
function fixUseClient(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      fixUseClient(fullPath);
      continue;
    }

    if ((file.endsWith('.jsx') || file.endsWith('.tsx')) && !file.includes('page')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Skip if already has use client
      if (content.includes('"use client"') || content.includes("'use client'")) continue;

      // Check if it needs client directive
      const needsClient = 
        content.includes('useState') ||
        content.includes('useEffect') ||
        content.includes('useRef') ||
        content.includes('useContext') ||
        content.includes('forwardRef') ||
        content.includes('@radix-ui') ||
        content.includes('framer-motion') ||
        content.includes('usePathname') ||
        content.includes('useRouter') ||
        content.includes('onClick') ||
        content.includes('onChange');

      if (needsClient) {
        const newContent = '"use client";\n\n' + content;
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`✅ Added "use client" to: ${path.basename(fullPath)}`);
        fixesApplied++;
      }
    }
  }
}

// ============================================================
// 2. FIX: Add Suspense to all pages using useSearchParams
// ============================================================
function fixSuspense(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      fixSuspense(fullPath);
      continue;
    }

    if (file === 'page.tsx' || file === 'page.jsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Check if it uses useSearchParams
      if (!content.includes('useSearchParams')) continue;
      
      // Check if already has Suspense wrapper
      if (content.includes('<Suspense') || content.includes('React.Suspense')) continue;

      // Find the component name
      const match = content.match(/export default function ([a-zA-Z0-9_]+)/);
      if (!match) continue;

      const componentName = match[1];
      
      // Transform: export default function Component() { ... }
      // To: function Component_Content() { ... } \n export default function Component() { return <Suspense>...</Suspense> }
      
      const newContent = content.replace(
        new RegExp(`export default function ${componentName}\\s*\\(`),
        `function ${componentName}_Content(`
      );

      const wrappedContent = newContent + `

export default function ${componentName}() {
  return (
    <React.Suspense fallback={<div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#FF8C21]"></div></div>}>
      <${componentName}_Content />
    </React.Suspense>
  );
}
`;

      // Add React import if missing
      let finalContent = wrappedContent;
      if (!wrappedContent.includes('import React')) {
        finalContent = "import React from 'react';\n" + wrappedContent;
      }

      fs.writeFileSync(fullPath, finalContent, 'utf8');
      console.log(`✅ Added Suspense wrapper to: ${fullPath}`);
      fixesApplied++;
    }
  }
}

// ============================================================
// 3. FIX: Prisma P2003 Errors - Add cascade delete to API routes
// ============================================================
function fixPrismaP2003(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      fixPrismaP2003(fullPath);
      continue;
    }

    if (file === 'route.ts' || file === 'route.js') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Check if it has delete operations
      if (!content.includes('.delete') && !content.includes('.deleteMany')) continue;
      
      // Check if P2003 handling already exists
      if (content.includes("err.code === 'P2003'")) continue;

      // Add P2003 handling to catch blocks
      const fixedContent = content.replace(
        /catch\s*\(\s*err:\s*any\s*\)\s*\{/g,
        `catch (err: any) {\n    if (err.code === 'P2003') {\n      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records. Please remove all related records first.' }, { status: 400 })\n    }`
      );

      if (content !== fixedContent) {
        fs.writeFileSync(fullPath, fixedContent, 'utf8');
        console.log(`✅ Added P2003 error handling to: ${path.basename(path.dirname(fullPath))}/route.ts`);
        fixesApplied++;
      }
    }
  }
}

// ============================================================
// 4. FIX: Add missing .env variables if missing
// ============================================================
function fixEnv() {
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  const required = {
    'DATABASE_URL': 'postgresql://postgres.ehiqtlofblrddauixeuz:Divya%40Yagyam%40123@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
    'DIRECT_URL': 'postgresql://postgres.ehiqtlofblrddauixeuz:Divya%40Yagyam%40123@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
    'NEXT_PUBLIC_SUPABASE_URL': 'https://ehiqtlofblrddauixeuz.supabase.co',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoaXF0bG9mYmxyZGRhdWl4ZXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NjQ0MzYsImV4cCI6MjA5OTI0MDQzNn0.h7oF__uWpYQEs_simd7RRxxhbfjAJNef4bNRjkdTdI0',
    'ADMIN_EMAIL': 'admin@divyayagyam.com',
    'ADMIN_PASSWORD': 'Admin@12345',
    'ADMIN_SESSION_SECRET': 'super-secret-key-108'
  };

  let envUpdated = false;
  for (const [key, value] of Object.entries(required)) {
    if (!envContent.includes(`${key}=`)) {
      envContent += `\n${key}=${value}`;
      envUpdated = true;
      console.log(`✅ Added missing ${key} to .env`);
      fixesApplied++;
    }
  }

  if (envUpdated) {
    fs.writeFileSync(envPath, envContent.trim(), 'utf8');
  }
}

// ============================================================
// EXECUTE ALL FIXES
// ============================================================

console.log('📂 Scanning project files...\n');

// 1. Fix UI components
const uiDir = path.join(process.cwd(), 'components', 'ui');
if (fs.existsSync(uiDir)) {
  console.log('🔧 Fixing UI components...');
  fixUseClient(uiDir);
} else {
  console.log('⚠️ components/ui folder not found, skipping UI fixes.');
}

// 2. Fix pages with useSearchParams
const appDir = path.join(process.cwd(), 'app');
if (fs.existsSync(appDir)) {
  console.log('\n🔧 Fixing pages with useSearchParams...');
  fixSuspense(appDir);
} else {
  console.log('⚠️ app folder not found, skipping Suspense fixes.');
}

// 3. Fix Prisma API routes
const apiDir = path.join(process.cwd(), 'app', 'api');
if (fs.existsSync(apiDir)) {
  console.log('\n🔧 Fixing Prisma delete operations...');
  fixPrismaP2003(apiDir);
} else {
  console.log('⚠️ app/api folder not found, skipping Prisma fixes.');
}

// 4. Fix .env file
console.log('\n🔧 Checking environment variables...');
fixEnv();

// ============================================================
// FINAL REPORT
// ============================================================
console.log('\n=============================================');
console.log(`✅ Auto-Fix Complete! Applied ${fixesApplied} fixes.`);
console.log('=============================================\n');

console.log('🚀 Next steps:');
console.log('1. Run: npm run build');
console.log('2. If build succeeds, run: npm run dev');
console.log('3. If you still see errors, share the error log with me.');
console.log('\n📌 Remember: If you have any custom modifications,');
console.log('   please backup your files before running this script.');
