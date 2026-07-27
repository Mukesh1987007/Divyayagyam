const fs = require('fs');
const path = require('path');

console.log('📱 Fixing Mobile Responsiveness & Runtime Errors...\n');

let fixes = 0;

// 1. Fix Chat Widget
const chatPath = path.join(process.cwd(), 'components', 'static-support-bot.tsx');
if (fs.existsSync(chatPath)) {
  let content = fs.readFileSync(chatPath, 'utf8');
  
  // Replace fixed width with responsive
  content = content.replace(
    /w-\[360px\]/g,
    'w-[calc(100vw-2rem)] max-w-[360px]'
  );
  content = content.replace(
    /h-\[520px\]/g,
    'h-[60vh] max-h-[520px]'
  );
  
  // Add overflow handling
  content = content.replace(
    /<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-orange-50\/30">/,
    '<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-orange-50/30" style={{ overscrollBehavior: "contain" }}>'
  );
  
  fs.writeFileSync(chatPath, content, 'utf8');
  console.log('✅ Fixed StaticSupportBot responsive issue');
  fixes++;
}

// 2. Add global CSS fixes
const cssPath = path.join(process.cwd(), 'app', 'globals.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');
  
  const mobileFixes = `
/* ===== MOBILE RESPONSIVE FIXES ===== */
@layer utilities {
  .safe-area-padding {
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
  .no-horizontal-scroll {
    overflow-x: hidden !important;
    max-width: 100vw !important;
  }
}

/* Fix containers on mobile */
@media (max-width: 640px) {
  .container {
    padding-left: 0.75rem !important;
    padding-right: 0.75rem !important;
  }
  
  /* Fix tables and overflowing elements */
  .overflow-x-auto {
    -webkit-overflow-scrolling: touch;
    max-width: 100vw;
  }
  
  /* Fix card padding */
  .card-content-mobile {
    padding: 1rem !important;
  }
  
  /* Fix chat widget on very small screens */
  .fixed.bottom-4.right-4 {
    bottom: 0.5rem !important;
    right: 0.5rem !important;
  }
}
`;

  // Append mobile fixes at the end
  if (!css.includes('MOBILE RESPONSIVE FIXES')) {
    css = css.trim() + '\n\n' + mobileFixes;
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('✅ Added mobile responsive CSS fixes');
    fixes++;
  } else {
    console.log('⚠️ Mobile CSS fixes already present.');
  }
}

console.log(`\n✅ Total fixes applied: ${fixes}`);
