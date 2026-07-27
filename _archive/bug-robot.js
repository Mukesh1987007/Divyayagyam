const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🐛 [Super Bug Robot] Starting Full Bug Detection Scan...\n');

// ============================================================
// CONFIGURATION
// ============================================================
const CONFIG = {
  scanDirs: ['app', 'components', 'lib', 'pages', 'api', 'hooks', 'utils'],
  ignoreDirs: ['node_modules', '.next', '.git', 'public', 'dist', 'build'],
  reportFile: 'bug-report.json',
  maxFileSize: 1024 * 1024, // 1MB
};

// ============================================================
// 1. FILE SCANNER
// ============================================================
function scanFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (CONFIG.ignoreDirs.includes(file)) continue;
      scanFiles(fullPath, results);
    } else {
      const ext = path.extname(file);
      if (['.tsx', '.jsx', '.ts', '.js', '.css', '.json', '.md'].includes(ext)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          results.push({
            file: fullPath,
            name: file,
            ext: ext,
            size: content.length,
            content: content,
            lines: content.split('\n').length,
          });
        } catch (e) {
          // Skip unreadable files
        }
      }
    }
  }
  return results;
}

// ============================================================
// 2. BUG DETECTORS
// ============================================================

function detectBugs(files) {
  const bugs = [];
  const stats = {
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  for (const file of files) {
    const content = file.content;
    const name = file.name;
    const filePath = file.file;

    // ============================================================
    // 🔴 CRITICAL BUGS (Crash/Exploit)
    // ============================================================

    // 1. Missing "use client" in client components
    if (content.includes('useState') || content.includes('useEffect') || 
        content.includes('useRef') || content.includes('useContext')) {
      if (!content.includes('"use client"') && !content.includes("'use client'")) {
        bugs.push({
          id: `CRIT-${bugs.length + 1}`,
          severity: 'CRITICAL',
          type: 'Missing "use client" Directive',
          file: filePath,
          line: findLineNumber(content, 'useState') || 1,
          description: 'Component uses React Hooks but missing "use client" directive',
          fix: 'Add `"use client";` at the very top of the file',
          code: content.slice(0, 200) + '...',
          impact: 'Application will crash on build or hydration',
        });
        stats.critical++;
      }
    }

    // 2. Missing Suspense for useSearchParams
    if (content.includes('useSearchParams') && !content.includes('Suspense')) {
      bugs.push({
        id: `CRIT-${bugs.length + 1}`,
        severity: 'CRITICAL',
        type: 'useSearchParams without Suspense',
        file: filePath,
        line: findLineNumber(content, 'useSearchParams'),
        description: 'useSearchParams used without Suspense boundary in Next.js 15',
        fix: 'Wrap component in <Suspense> boundary',
        code: `<Suspense fallback={<div>Loading...</div>}>\n  <Component />\n</Suspense>`,
        impact: 'Build failure or runtime crash',
      });
      stats.critical++;
    }

    // 3. Direct localStorage without window check
    if (content.includes('localStorage') && !content.includes('typeof window')) {
      bugs.push({
        id: `CRIT-${bugs.length + 1}`,
        severity: 'CRITICAL',
        type: 'Direct localStorage Access',
        file: filePath,
        line: findLineNumber(content, 'localStorage'),
        description: 'localStorage accessed without window existence check',
        fix: 'Wrap in `if (typeof window !== "undefined")`',
        code: `if (typeof window !== 'undefined') {\n  localStorage.setItem('key', 'value');\n}`,
        impact: 'Server-side rendering crash',
      });
      stats.critical++;
    }

    // 4. Missing error handling in API routes
    if (filePath.includes('/api/') && filePath.endsWith('route.ts')) {
      if (!content.includes('try {') || !content.includes('catch')) {
        bugs.push({
          id: `CRIT-${bugs.length + 1}`,
          severity: 'CRITICAL',
          type: 'Missing Error Handling',
          file: filePath,
          line: 1,
          description: 'API route missing try-catch error handling',
          fix: 'Wrap API logic in try-catch block',
          code: `try {\n  // API logic\n} catch (error) {\n  return NextResponse.json({ ok: false, error: error.message }, { status: 500 });\n}`,
          impact: 'API will crash and return 500 without proper error message',
        });
        stats.critical++;
      }
    }

    // 5. Exposed secrets in code
    const secretPatterns = [
      /API_KEY\s*=\s*['"][^'"]+['"]/,
      /SECRET\s*=\s*['"][^'"]+['"]/,
      /PASSWORD\s*=\s*['"][^'"]+['"]/,
      /TOKEN\s*=\s*['"][^'"]+['"]/,
      /KEY\s*=\s*['"][^'"]+['"]/,
    ];
    for (const pattern of secretPatterns) {
      if (pattern.test(content) && !filePath.includes('.env')) {
        bugs.push({
          id: `CRIT-${bugs.length + 1}`,
          severity: 'CRITICAL',
          type: 'Exposed Secret',
          file: filePath,
          line: findLineNumber(content, pattern),
          description: 'Potential secret key exposed in source code',
          fix: 'Move to .env file and use process.env',
          code: `const apiKey = process.env.API_KEY;`,
          impact: 'Security vulnerability - secrets may be exposed',
        });
        stats.critical++;
        break;
      }
    }

    // ============================================================
    // 🟠 HIGH PRIORITY BUGS
    // ============================================================

    // 6. Large component (>300 lines)
    if (file.lines > 300 && (file.ext === '.tsx' || file.ext === '.jsx')) {
      bugs.push({
        id: `HIGH-${bugs.length + 1}`,
        severity: 'HIGH',
        type: 'Large Component',
        file: filePath,
        line: 1,
        description: `Component has ${file.lines} lines (>300)`,
        fix: 'Split into smaller components or use lazy loading',
        code: `const HeavyComponent = dynamic(() => import('./HeavyComponent'), { ssr: false });`,
        impact: 'Slow performance and difficult maintenance',
      });
      stats.high++;
    }

    // 7. Unoptimized image loading
    if (content.includes('<img') && !content.includes('next/image')) {
      bugs.push({
        id: `HIGH-${bugs.length + 1}`,
        severity: 'HIGH',
        type: 'Unoptimized Images',
        file: filePath,
        line: findLineNumber(content, '<img'),
        description: 'Using <img> instead of Next.js Image component',
        fix: 'Replace with `import Image from "next/image"`',
        code: `<Image src="..." alt="..." width={400} height={300} loading="lazy" />`,
        impact: 'Slow page load and poor Core Web Vitals',
      });
      stats.high++;
    }

    // 8. Missing cache headers in API
    if (filePath.includes('/api/') && filePath.endsWith('route.ts')) {
      if (content.includes('NextResponse.json') && !content.includes('Cache-Control')) {
        bugs.push({
          id: `HIGH-${bugs.length + 1}`,
          severity: 'HIGH',
          type: 'Missing Cache Headers',
          file: filePath,
          line: 1,
          description: 'API route missing Cache-Control headers',
          fix: 'Add caching headers to improve performance',
          code: `response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120');`,
          impact: 'Unnecessary database queries and slow API responses',
        });
        stats.high++;
      }
    }

    // 9. Missing revalidation in pages
    if (filePath.includes('page.tsx') && !filePath.includes('admin')) {
      if (!content.includes('export const revalidate') && 
          !content.includes('export const dynamic')) {
        bugs.push({
          id: `HIGH-${bugs.length + 1}`,
          severity: 'HIGH',
          type: 'Missing Revalidation',
          file: filePath,
          line: 1,
          description: 'Page missing revalidation for ISR',
          fix: 'Add `export const revalidate = 3600;`',
          code: `export const revalidate = 3600; // Revalidate every hour`,
          impact: 'Pages not cached, slower load times',
        });
        stats.high++;
      }
    }

    // 10. Unoptimized Prisma queries
    if (content.includes('prisma.') && content.includes('.findMany')) {
      if (!content.includes('select:') && !content.includes('include:')) {
        bugs.push({
          id: `HIGH-${bugs.length + 1}`,
          severity: 'HIGH',
          type: 'Unoptimized Database Query',
          file: filePath,
          line: findLineNumber(content, 'findMany'),
          description: 'Prisma query fetching all fields without select',
          fix: 'Use `select: {}` to fetch only needed fields',
          code: `select: { id: true, name: true, price: true }`,
          impact: 'Slow database queries and large JSON responses',
        });
        stats.high++;
      }
    }

    // ============================================================
    // 🟡 MEDIUM PRIORITY BUGS
    // ============================================================

    // 11. Missing aria labels
    if ((content.includes('<button') || content.includes('<input')) && 
        !content.includes('aria-label') && !content.includes('aria-labelledby')) {
      bugs.push({
        id: `MED-${bugs.length + 1}`,
        severity: 'MEDIUM',
        type: 'Missing ARIA Labels',
        file: filePath,
        line: findLineNumber(content, '<button') || findLineNumber(content, '<input'),
        description: 'Interactive element missing aria-label for accessibility',
        fix: 'Add `aria-label="Description"` to the element',
        code: `<button aria-label="Close menu">X</button>`,
        impact: 'Poor accessibility for screen reader users',
      });
      stats.medium++;
    }

    // 12. Console.log in production
    if (content.includes('console.log') && filePath.includes('/app/')) {
      bugs.push({
        id: `MED-${bugs.length + 1}`,
        severity: 'MEDIUM',
        type: 'Console.log in Production',
        file: filePath,
        line: findLineNumber(content, 'console.log'),
        description: 'console.log statement in production code',
        fix: 'Remove or replace with proper logging',
        code: `// Remove or use: if (process.env.NODE_ENV === 'development') console.log(...)`,
        impact: 'Unnecessary logging, potential performance impact',
      });
      stats.medium++;
    }

    // 13. Hardcoded URLs
    const urlPattern = /https?:\/\/[^'\s"]+/g;
    const urls = content.match(urlPattern);
    if (urls) {
      for (const url of urls) {
        if (!url.includes('localhost') && !url.includes('vercel') && 
            !url.includes('supabase') && !url.includes('api') &&
            !url.includes('example.com') && !url.includes('test')) {
          bugs.push({
            id: `MED-${bugs.length + 1}`,
            severity: 'MEDIUM',
            type: 'Hardcoded URL',
            file: filePath,
            line: findLineNumber(content, url),
            description: `Hardcoded URL: ${url}`,
            fix: 'Move to environment variables',
            code: `const apiUrl = process.env.NEXT_PUBLIC_API_URL;`,
            impact: 'Difficult to change in different environments',
          });
          stats.medium++;
          break;
        }
      }
    }

    // 14. Missing key in map
    if (content.includes('.map(') && !content.includes('.map((')) {
      // Check if key is used
      if (!content.includes('key=') && !content.includes('key={')) {
        bugs.push({
          id: `MED-${bugs.length + 1}`,
          severity: 'MEDIUM',
          type: 'Missing Key in Map',
          file: filePath,
          line: findLineNumber(content, '.map('),
          description: 'Array.map() without key prop',
          fix: 'Add `key={index}` or `key={item.id}`',
          code: `{items.map((item) => <div key={item.id}>...</div>)}`,
          impact: 'React reconciliation issues and performance problems',
        });
        stats.medium++;
      }
    }

    // ============================================================
    // 🟢 LOW PRIORITY BUGS
    // ============================================================

    // 15. Fixed widths without responsiveness
    if (content.includes('w-[', 'min-w-[') && !content.includes('sm:')) {
      bugs.push({
        id: `LOW-${bugs.length + 1}`,
        severity: 'LOW',
        type: 'Non-Responsive Width',
        file: filePath,
        line: findLineNumber(content, 'w-['),
        description: 'Fixed width without responsive fallback',
        fix: 'Add responsive classes: sm:, md:, lg:',
        code: `className="w-full sm:w-1/2 lg:w-1/3"`,
        impact: 'Poor mobile experience',
      });
      stats.low++;
    }

    // 16. TODO comments
    if (content.includes('TODO') || content.includes('FIXME')) {
      bugs.push({
        id: `LOW-${bugs.length + 1}`,
        severity: 'LOW',
        type: 'TODO/FIXME Comment',
        file: filePath,
        line: findLineNumber(content, 'TODO') || findLineNumber(content, 'FIXME'),
        description: 'Unresolved TODO or FIXME comment',
        fix: 'Resolve the issue or remove the comment',
        code: '// TODO: Fix this later',
        impact: 'Technical debt',
      });
      stats.low++;
    }
  }

  return { bugs, stats };
}

// ============================================================
// 3. HELPER FUNCTIONS
// ============================================================

function findLineNumber(content, search) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (typeof search === 'string') {
      if (lines[i].includes(search)) return i + 1;
    } else if (search instanceof RegExp) {
      if (search.test(lines[i])) return i + 1;
    }
  }
  return 0;
}

function generateReport(bugs, stats) {
  const criticalBugs = bugs.filter(b => b.severity === 'CRITICAL');
  const highBugs = bugs.filter(b => b.severity === 'HIGH');
  const mediumBugs = bugs.filter(b => b.severity === 'MEDIUM');
  const lowBugs = bugs.filter(b => b.severity === 'LOW');

  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalBugs: bugs.length,
      critical: stats.critical,
      high: stats.high,
      medium: stats.medium,
      low: stats.low,
    },
    priorityBreakdown: {
      '🔴 CRITICAL (Fix Now)': criticalBugs.length,
      '🟠 HIGH (Fix Soon)': highBugs.length,
      '🟡 MEDIUM (Fix Later)': mediumBugs.length,
      '🟢 LOW (Nice to Have)': lowBugs.length,
    },
    bugs: bugs,
    criticalBugs: criticalBugs,
    highBugs: highBugs,
    mediumBugs: mediumBugs,
    lowBugs: lowBugs,
    // Auto-fix instructions
    autoFixCommands: {
      critical: 'node fix-critical.js',
      high: 'node fix-high.js',
      all: 'node fix-all.js',
    },
    // Priority list for AI
    aiPrompt: generateAIPrompt(bugs),
  };
}

// ============================================================
// 4. AI PROMPT GENERATOR
// ============================================================
function generateAIPrompt(bugs) {
  const critical = bugs.filter(b => b.severity === 'CRITICAL');
  const high = bugs.filter(b => b.severity === 'HIGH');

  return `
You are an expert Next.js bug fixer. Fix these ${bugs.length} bugs:

🔴 CRITICAL BUGS (${critical.length}):
${critical.map(b => `
- File: ${b.file}
- Bug: ${b.type}
- Fix: ${b.fix}
`).join('\n')}

🟠 HIGH PRIORITY BUGS (${high.length}):
${high.slice(0, 10).map(b => `
- File: ${b.file}
- Bug: ${b.type}
- Fix: ${b.fix}
`).join('\n')}

Provide specific code fixes for each bug with exact file paths and before/after code.
`;
}

// ============================================================
// 5. EXECUTE SCAN
// ============================================================

console.log('📂 Scanning project files...');
const allFiles = scanFiles(process.cwd());
console.log(`✅ Found ${allFiles.length} files`);

console.log('\n🐛 Detecting bugs...');
const { bugs, stats } = detectBugs(allFiles);
console.log(`✅ Found ${bugs.length} bugs`);

console.log('\n📝 Generating report...');
const report = generateReport(bugs, stats);
fs.writeFileSync(CONFIG.reportFile, JSON.stringify(report, null, 2));
console.log(`✅ Report saved to: ${CONFIG.reportFile}`);

// ============================================================
// 6. PRINT SUMMARY
// ============================================================
console.log('\n' + '='.repeat(60));
console.log('🐛 BUG DETECTION SUMMARY');
console.log('='.repeat(60));

console.log(`\n📊 Total Bugs Found: ${bugs.length}`);
console.log(`  🔴 CRITICAL: ${stats.critical}`);
console.log(`  🟠 HIGH:     ${stats.high}`);
console.log(`  🟡 MEDIUM:   ${stats.medium}`);
console.log(`  🟢 LOW:      ${stats.low}`);

console.log('\n🎯 TOP 5 CRITICAL BUGS:');
const criticalBugs = bugs.filter(b => b.severity === 'CRITICAL').slice(0, 5);
criticalBugs.forEach((bug, idx) => {
  console.log(`\n${idx + 1}. ${bug.type}`);
  console.log(`   File: ${path.basename(bug.file)}`);
  console.log(`   Fix: ${bug.fix}`);
});

console.log('\n' + '='.repeat(60));
console.log('🤖 AI PROMPT READY:');
console.log('='.repeat(60));
console.log(report.aiPrompt.slice(0, 800) + '...\n');

console.log('\n🚀 NEXT STEPS:');
console.log('1. Open bug-report.json');
console.log('2. Run: node fix-critical.js (to auto-fix critical bugs)');
console.log('3. Or share the "aiPrompt" field with me');
console.log('4. Run: node auto-robot.js (to verify fixes)');

console.log('\n✅ Bug scan complete!');
