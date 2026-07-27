const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🤖 [Auto-Diagnostic Robot] Starting Full System Scan...\n');

// ============================================================
// ROBOT CONFIGURATION
// ============================================================
const CONFIG = {
  scanDirs: ['app', 'components', 'lib', 'pages', 'api'],
  ignoreDirs: ['node_modules', '.next', '.git', 'public'],
  reportFile: 'robot-report.json',
  maxFileSize: 1024 * 1024, // 1MB
  aiPromptTemplate: `You are an expert Next.js performance engineer. 
Analyze these issues and provide specific code fixes.
Reply with exact code changes and explanations.`
};

// ============================================================
// 1. FILE SCANNER
// ============================================================
function scanProject(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (CONFIG.ignoreDirs.includes(file)) continue;
      scanProject(fullPath, results);
    } else {
      const ext = path.extname(file);
      if (['.tsx', '.jsx', '.ts', '.js', '.css', '.json'].includes(ext)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        results.push({
          file: fullPath,
          name: file,
          ext: ext,
          size: content.length,
          content: content.slice(0, 5000), // ⭐ Limited for AI
          lines: content.split('\n').length,
        });
      }
    }
  }
  return results;
}

// ============================================================
// 2. ISSUE DETECTOR
// ============================================================
function detectIssues(files) {
  const issues = [];
  let score = 100; // Start with perfect score

  for (const file of files) {
    const content = file.content;
    const name = file.name;

    // 🔴 CRITICAL: Missing "use client"
    if (content.includes('useState') || content.includes('useEffect')) {
      if (!content.includes('"use client"') && !content.includes("'use client'")) {
        issues.push({
          type: 'CRITICAL',
          file: file.file,
          issue: 'Missing "use client" directive',
          fix: 'Add `"use client";` at the very top of the file',
          code: `"use client";\n\n${content.slice(0, 200)}...`
        });
        score -= 10;
      }
    }

    // 🟡 PERFORMANCE: Large component
    if (file.lines > 300) {
      issues.push({
        type: 'PERFORMANCE',
        file: file.file,
        issue: 'Large component (>300 lines)',
        fix: 'Split into smaller components or use lazy loading',
        suggestion: `dynamic(() => import('./${name}'), { ssr: false })`
      });
      score -= 3;
    }

    // 🟡 PERFORMANCE: Direct image tags
    if (content.includes('<img') && !content.includes('next/image')) {
      issues.push({
        type: 'PERFORMANCE',
        file: file.file,
        issue: 'Using <img> instead of next/image',
        fix: 'Replace with Next.js Image component for optimization',
        code: `import Image from 'next/image';\n<Image src="..." alt="..." width={400} height={300} />`
      });
      score -= 5;
    }

    // 🔴 CRITICAL: Missing Suspense
    if (content.includes('useSearchParams') && !content.includes('Suspense')) {
      issues.push({
        type: 'CRITICAL',
        file: file.file,
        issue: 'useSearchParams used without Suspense boundary',
        fix: 'Wrap component in React.Suspense',
        code: `<Suspense fallback={<div>Loading...</div>}>\n  <Component />\n</Suspense>`
      });
      score -= 10;
    }

    // 🟡 PERFORMANCE: Large API response
    if (file.file.includes('api') && file.size > 50000) {
      issues.push({
        type: 'PERFORMANCE',
        file: file.file,
        issue: 'Large API response size (>50KB)',
        fix: 'Add pagination (skip/take) and limit fields',
        code: `const page = parseInt(searchParams.get('page') || '1');\nconst limit = parseInt(searchParams.get('limit') || '20');\nconst skip = (page - 1) * limit;`
      });
      score -= 5;
    }

    // 🟡 PERFORMANCE: No cache headers
    if (file.file.includes('api') && content.includes('NextResponse.json')) {
      if (!content.includes('Cache-Control')) {
        issues.push({
          type: 'PERFORMANCE',
          file: file.file,
          issue: 'Missing Cache-Control headers in API',
          fix: 'Add caching headers for faster responses',
          code: `response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120');`
        });
        score -= 3;
      }
    }

    // 🟢 STYLING: Mobile responsiveness
    if (content.includes('w-[') || content.includes('min-w-[')) {
      if (!content.includes('max-w-') && !content.includes('sm:')) {
        issues.push({
          type: 'RESPONSIVENESS',
          file: file.file,
          issue: 'Fixed widths without mobile fallback',
          fix: 'Add responsive classes: sm:, md:, lg:',
          code: `className="w-full sm:w-1/2 lg:w-1/3"`
        });
        score -= 2;
      }
    }

    // 🔴 CRITICAL: Direct localStorage
    if (content.includes('localStorage') && !content.includes('typeof window')) {
      issues.push({
        type: 'CRITICAL',
        file: file.file,
        issue: 'localStorage access without window check',
        fix: 'Wrap in typeof window !== "undefined" check',
        code: `if (typeof window !== 'undefined') {\n  localStorage.setItem('key', 'value');\n}`
      });
      score -= 8;
    }

    // 🟡 PERFORMANCE: Unoptimized database query
    if (file.file.includes('api') && content.includes('prisma.') && content.includes('.findMany')) {
      if (!content.includes('select:') && !content.includes('include:')) {
        issues.push({
          type: 'PERFORMANCE',
          file: file.file,
          issue: 'Prisma query fetching all fields',
          fix: 'Use select: {} to fetch only needed fields',
          code: `select: { id: true, name: true, price: true }`
        });
        score -= 3;
      }
    }

    // 🟡 PERFORMANCE: No revalidation
    if (file.file.includes('page.tsx') && !content.includes('revalidate')) {
      issues.push({
        type: 'PERFORMANCE',
        file: file.file,
        issue: 'Page without revalidation (static/ISR)',
        fix: 'Add revalidate for ISR',
        code: `export const revalidate = 3600; // Revalidate every hour`
      });
      score -= 3;
    }

    // 🟡 SECURITY: Exposed secrets
    const secrets = ['API_KEY', 'SECRET', 'PASSWORD', 'TOKEN'];
    for (const secret of secrets) {
      if (content.includes(secret) && !file.file.includes('.env')) {
        issues.push({
          type: 'SECURITY',
          file: file.file,
          issue: `Potential secret (${secret}) exposed in code`,
          fix: 'Move to .env file and use process.env',
          code: `const apiKey = process.env.${secret};`
        });
        score -= 15;
        break;
      }
    }
  }

  return { issues, score: Math.max(0, score) };
}

// ============================================================
// 3. AI PROMPT GENERATOR
// ============================================================
function generateAIPrompt(issues, score) {
  const criticalIssues = issues.filter(i => i.type === 'CRITICAL');
  const performanceIssues = issues.filter(i => i.type === 'PERFORMANCE');
  const otherIssues = issues.filter(i => i.type !== 'CRITICAL' && i.type !== 'PERFORMANCE');

  return `
${CONFIG.aiPromptTemplate}

## Project Health Score: ${score}/100

### 🔴 CRITICAL ISSUES (${criticalIssues.length})
${criticalIssues.map(i => `
- **File:** ${i.file}
- **Issue:** ${i.issue}
- **Fix:** ${i.fix}
- **Code:** ${i.code || 'Not provided'}
`).join('\n')}

### 🟡 PERFORMANCE ISSUES (${performanceIssues.length})
${performanceIssues.map(i => `
- **File:** ${i.file}
- **Issue:** ${i.issue}
- **Fix:** ${i.fix}
- **Suggestion:** ${i.suggestion || i.code || 'Not provided'}
`).join('\n')}

### 🟢 OTHER ISSUES (${otherIssues.length})
${otherIssues.map(i => `
- **File:** ${i.file}
- **Issue:** ${i.issue}
- **Fix:** ${i.fix}
`).join('\n')}

## 🎯 PRIORITY FIXES (Top 5)
${issues.slice(0, 5).map((i, idx) => `
${idx + 1}. **${i.type}** - ${i.file}
   - ${i.issue}
   - ${i.fix}
`).join('\n')}

Please provide specific code fixes for each issue. Include:
1. Exact file path
2. Before/After code
3. Explanation of the fix
`;
}

// ============================================================
// 4. REPORT GENERATOR
// ============================================================
function generateReport(issues, score, aiPrompt) {
  const report = {
    timestamp: new Date().toISOString(),
    healthScore: score,
    summary: {
      totalIssues: issues.length,
      critical: issues.filter(i => i.type === 'CRITICAL').length,
      performance: issues.filter(i => i.type === 'PERFORMANCE').length,
      security: issues.filter(i => i.type === 'SECURITY').length,
      responsiveness: issues.filter(i => i.type === 'RESPONSIVENESS').length,
    },
    issues: issues,
    aiPrompt: aiPrompt,
    fixCommands: [
      'npm run build',
      'npm run dev',
      'node auto-robot.js', // Re-run after fixes
    ],
    priorityFixes: issues.slice(0, 5).map(i => ({
      file: i.file,
      issue: i.issue,
      fix: i.fix,
    })),
  };

  fs.writeFileSync(CONFIG.reportFile, JSON.stringify(report, null, 2));
  return report;
}

// ============================================================
// 5. EXECUTE SCAN
// ============================================================
console.log('📂 Scanning project files...');
const allFiles = scanProject(path.join(process.cwd(), 'app'));
console.log(`✅ Found ${allFiles.length} files`);

console.log('\n🔍 Detecting issues...');
const { issues, score } = detectIssues(allFiles);
console.log(`✅ Found ${issues.length} issues`);

console.log('\n🤖 Generating AI prompt...');
const aiPrompt = generateAIPrompt(issues, score);

console.log('\n📝 Generating report...');
const report = generateReport(issues, score, aiPrompt);
console.log(`✅ Report saved to: ${CONFIG.reportFile}`);

// ============================================================
// 6. PRINT SUMMARY
// ============================================================
console.log('\n' + '='.repeat(50));
console.log('📊 DIAGNOSTIC SUMMARY');
console.log('='.repeat(50));
console.log(`🟢 Health Score: ${score}/100`);
console.log(`\n📋 Issues Found: ${issues.length}`);
console.log(`  🔴 Critical: ${report.summary.critical}`);
console.log(`  🟡 Performance: ${report.summary.performance}`);
console.log(`  🔵 Security: ${report.summary.security}`);
console.log(`  🟢 Responsiveness: ${report.summary.responsiveness}`);

console.log('\n🎯 TOP 5 PRIORITY FIXES:');
report.priorityFixes.forEach((fix, idx) => {
  console.log(`\n${idx + 1}. ${fix.file}`);
  console.log(`   Issue: ${fix.issue}`);
  console.log(`   Fix: ${fix.fix}`);
});

console.log('\n' + '='.repeat(50));
console.log('🤖 AI PROMPT READY:');
console.log('='.repeat(50));
console.log(aiPrompt.slice(0, 500) + '...\n');
console.log(`Full AI prompt saved in: ${CONFIG.reportFile}`);

console.log('\n🚀 NEXT STEPS:');
console.log('1. Open robot-report.json');
console.log('2. Copy the "aiPrompt" field');
console.log('3. Paste it to me (AI) for fixes');
console.log('4. Or run: node auto-fix.js (to apply auto-fixes)');

console.log('\n✅ Robot scan complete!');
