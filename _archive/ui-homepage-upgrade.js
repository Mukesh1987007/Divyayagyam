const fs = require('fs');
const path = require('path');

console.log('🎨 [UI Upgrade] Professional Spiritual Homepage\n');

// ============================================================
// 1. GLOBALS.CSS - Complete Spiritual Theme
// ============================================================
function upgradeGlobals() {
  const filePath = path.join(process.cwd(), 'app', 'globals.css');
  if (!fs.existsSync(filePath)) return;

  const theme = `
/* ============================================================
   🕉️ DIVYAYAGYAM - PROFESSIONAL SPIRITUAL THEME
   ============================================================ */

/* -------- SACRED COLOR PALETTE -------- */
:root {
  --saffron: #FF7A00;
  --saffron-light: #FF9A3C;
  --sindoor: #D42A2A;
  --gold: #C9A84C;
  --gold-light: #E8D5A3;
  --cream: #FFF8F0;
  --sand: #F5EDE4;
  --charcoal: #1A1410;
  --warm-brown: #5C3D2E;
  --divine-gold: #B8860B;
  
  --gradient-primary: linear-gradient(135deg, #FF7A00 0%, #D42A2A 50%, #C9A84C 100%);
  --gradient-hero: linear-gradient(135deg, rgba(255, 122, 0, 0.08) 0%, rgba(212, 42, 42, 0.05) 50%, rgba(201, 168, 76, 0.08) 100%);
  --gradient-card: linear-gradient(145deg, rgba(255, 248, 240, 0.9), rgba(255, 255, 255, 0.95));
  
  --shadow-soft: 0 8px 40px rgba(26, 20, 16, 0.06);
  --shadow-medium: 0 12px 60px rgba(26, 20, 16, 0.08);
  --shadow-heavy: 0 20px 80px rgba(26, 20, 16, 0.12);
  --shadow-glow: 0 8px 40px rgba(255, 122, 0, 0.15);
}

/* -------- BASE -------- */
body {
  background: var(--cream);
  background-image: 
    radial-gradient(ellipse at 10% 0%, rgba(255, 122, 0, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse at 90% 100%, rgba(212, 42, 42, 0.04) 0%, transparent 60%);
  font-family: 'Outfit', system-ui, -apple-system, sans-serif;
  color: var(--charcoal);
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

/* -------- TYPOGRAPHY -------- */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Cinzel', 'Georgia', serif;
  letter-spacing: 0.03em;
  line-height: 1.25;
}

.sacred-gradient-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sacred-subtitle {
  font-family: 'Cinzel', serif;
  color: var(--warm-brown);
  letter-spacing: 0.12em;
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 600;
}

/* -------- BUTTONS -------- */
.btn-primary-sacred {
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: 14px 36px;
  border-radius: 60px;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-glow);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.btn-primary-sacred:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 50px rgba(255, 122, 0, 0.25);
}

.btn-outline-sacred {
  background: transparent;
  color: var(--sindoor);
  border: 2px solid var(--sindoor);
  padding: 12px 32px;
  border-radius: 60px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.btn-outline-sacred:hover {
  background: var(--sindoor);
  color: white;
  transform: translateY(-2px);
}

/* -------- CARDS -------- */
.card-sacred {
  background: var(--gradient-card);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(201, 168, 76, 0.12);
  border-radius: 24px;
  padding: 28px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-soft);
}

.card-sacred:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-medium);
  border-color: rgba(201, 168, 76, 0.25);
}

/* -------- GLOW EFFECTS -------- */
.divine-glow {
  position: relative;
}

.divine-glow::before {
  content: '';
  position: absolute;
  inset: -50px;
  background: radial-gradient(ellipse at center, rgba(255, 122, 0, 0.06), transparent 70%);
  pointer-events: none;
  z-index: 0;
}

/* -------- OM DECORATION -------- */
.om-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: var(--gradient-primary);
  border-radius: 50%;
  color: white;
  font-size: 26px;
  font-weight: 700;
  font-family: 'Cinzel', serif;
  box-shadow: var(--shadow-glow);
  flex-shrink: 0;
}

.om-badge-sm {
  width: 40px;
  height: 40px;
  font-size: 18px;
}

/* -------- NAVBAR -------- */
.navbar-spiritual {
  background: rgba(255, 248, 240, 0.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(201, 168, 76, 0.15);
  box-shadow: 0 1px 20px rgba(26, 20, 16, 0.04);
}

.nav-link-spiritual {
  color: var(--charcoal);
  font-weight: 500;
  font-size: 0.9rem;
  padding: 8px 16px;
  border-radius: 40px;
  transition: all 0.3s ease;
  position: relative;
  text-decoration: none;
}

.nav-link-spiritual:hover {
  color: var(--saffron);
  background: rgba(255, 122, 0, 0.06);
}

.nav-link-spiritual.active {
  color: var(--saffron);
  background: rgba(255, 122, 0, 0.08);
}

/* -------- HERO SECTION -------- */
.hero-spiritual {
  position: relative;
  padding: 80px 0 60px;
  background: linear-gradient(180deg, rgba(255, 248, 240, 0.5) 0%, transparent 100%);
  overflow: hidden;
}

.hero-spiritual::after {
  content: 'ॐ';
  position: absolute;
  right: -5%;
  top: -10%;
  font-size: 40vw;
  opacity: 0.03;
  font-family: 'Cinzel', serif;
  pointer-events: none;
  color: var(--saffron);
}

/* -------- STATS BADGES -------- */
.stat-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(201, 168, 76, 0.1);
  border-radius: 60px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--charcoal);
}

.stat-badge .icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  color: white;
  font-size: 14px;
}

/* -------- SECTION HEADERS -------- */
.section-header {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 48px;
}

.section-header .badge {
  display: inline-block;
  padding: 6px 20px;
  background: rgba(201, 168, 76, 0.12);
  color: var(--warm-brown);
  border-radius: 40px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 12px;
  border: 1px solid rgba(201, 168, 76, 0.15);
}

.section-header h2 {
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 12px;
}

.section-header p {
  color: var(--warm-brown);
  font-size: 1.1rem;
  opacity: 0.8;
}

/* -------- RESPONSIVE -------- */
@media (max-width: 768px) {
  .section-header h2 {
    font-size: 2rem;
  }
  
  .hero-spiritual {
    padding: 40px 0 40px;
  }
  
  .stat-badge {
    padding: 6px 14px;
    font-size: 0.75rem;
  }
  
  .btn-primary-sacred,
  .btn-outline-sacred {
    padding: 10px 24px;
    font-size: 0.85rem;
  }
}

/* -------- SCROLLBAR -------- */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--cream);
}
::-webkit-scrollbar-thumb {
  background: var(--gradient-primary);
  border-radius: 4px;
}
`;

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove existing theme if any
  const themeStart = content.indexOf('/* ============================================================');
  if (themeStart > -1) {
    content = content.substring(0, themeStart);
  }
  
  content = content.trim() + '\n\n' + theme;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Updated: globals.css (Professional Spiritual Theme)');
}

// ============================================================
// 2. HOMEPAGE - Professional Spiritual Layout
// ============================================================
function upgradeHomepage() {
  const filePath = path.join(process.cwd(), 'app', '(marketing)', 'page.tsx');
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // -------- HERO SECTION UPGRADE --------
  content = content.replace(
    /<section className="relative overflow-hidden bg-gradient-to-b from-amber-50\/70 via-amber-50\/30 to-transparent pt-24 pb-20">/,
    `<section className="relative overflow-hidden hero-spiritual">`
  );

  // Add OM background to hero
  content = content.replace(
    /<div className="absolute inset-0 bg-\[radial-gradient\(circle_at_center,_var\(--tw-gradient-stops\)\)\] from-amber-500\/5 via-transparent to-transparent opacity-60 pointer-events-none" \/>/,
    `<div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,_rgba(255,122,0,0.06),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,_rgba(212,42,42,0.04),transparent_60%)]" />
    </div>`
  );

  // -------- BADGE UPGRADE --------
  content = content.replace(
    /<Badge className="bg-amber-500\/10 border border-amber-500\/30 text-amber-700 hover:bg-amber-500\/20 px-3 py-1 text-sm font-semibold rounded-full w-fit">/,
    `<Badge className="bg-amber-500/10 border border-amber-500/30 text-amber-700 hover:bg-amber-500/20 px-4 py-1.5 text-sm font-semibold rounded-full w-fit flex items-center gap-2">
      <span className="text-base">🕉️</span>`
  );

  // -------- HEADING UPGRADE --------
  content = content.replace(
    /<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-normal text-slate-900">/,
    `<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900">`
  );

  content = content.replace(
    /<span className="text-om-gradient">पवित्र पूजा<\/span> व <span className="text-om-gradient">अनुष्ठान<\/span>/,
    `<span className="sacred-gradient-text">पवित्र पूजा</span> व <span className="sacred-gradient-text">अनुष्ठान</span>`
  );

  // -------- BUTTONS UPGRADE --------
  content = content.replace(
    /<Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold text-base px-8 py-6 rounded-xl shadow-lg shadow-primary\/20 transition-all hover:scale-\[1.02\]" asChild>/,
    `<Button size="lg" className="btn-primary-sacred" asChild>`
  );

  content = content.replace(
    /<Button size="lg" variant="outline" className="border-amber-200 bg-white hover:bg-amber-50\/50 text-slate-700 px-8 py-6 rounded-xl transition-all" asChild>/,
    `<Button size="lg" variant="outline" className="btn-outline-sacred" asChild>`
  );

  // -------- STATS UPGRADE --------
  content = content.replace(
    /<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-amber-200\/80">/,
    `<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-amber-200/60">`
  );

  // -------- SERVICES CARDS UPGRADE --------
  content = content.replace(
    /<Card className="h-full transition-all duration-300 border border-slate-100 hover:border-orange-500\/20 hover:shadow-xl hover:-translate-y-1">/g,
    `<Card className="card-sacred h-full">`
  );

  // -------- PUJA CARDS UPGRADE --------
  content = content.replace(
    /<Card className="overflow-hidden group border border-slate-100 hover:shadow-xl transition-all flex flex-col justify-between h-full bg-white">/g,
    `<Card className="card-sacred overflow-hidden group h-full flex flex-col justify-between p-0">`
  );

  // -------- TESTIMONIAL CARDS UPGRADE --------
  content = content.replace(
    /<Card className="border border-slate-100 hover:shadow-lg transition-all">/g,
    `<Card className="card-sacred">`
  );

  // -------- LIVE STREAM SECTION UPGRADE --------
  content = content.replace(
    /<div className="rounded-\[2\.5rem\] bg-gradient-to-br from-amber-500\/10 via-orange-500\/5 to-transparent border border-amber-200\/50 p-1 shadow-sm">/,
    `<div className="rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-200/50 p-1 shadow-sm divine-glow">`
  );

  // -------- APP BANNER UPGRADE --------
  content = content.replace(
    /<div className="rounded-\[2\.5rem\] bg-gradient-to-br from-amber-500\/10 via-orange-500\/5 to-transparent border border-amber-200\/50 p-8 md:p-14 shadow-sm relative overflow-hidden">/,
    `<div className="rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-200/50 p-8 md:p-14 shadow-sm relative overflow-hidden divine-glow">`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Updated: Homepage (Professional Spiritual Layout)');
}

// ============================================================
// 3. NAVBAR - Premium Spiritual
// ============================================================
function upgradeNavbar() {
  const filePath = path.join(process.cwd(), 'components', 'layouts', 'navbar.tsx');
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Premium navbar classes
  content = content.replace(
    /<header className="sticky top-0 z-50 w-full border-b border-amber-100\/50 bg-white\/95 dark:bg-slate-950\/95 backdrop-blur-md shadow-sm transition-all">/,
    `<header className="sticky top-0 z-50 w-full navbar-spiritual shadow-sm transition-all">`
  );

  // Premium nav links
  content = content.replace(
    /className="px-3\.5 py-2 rounded-full text-sm font-semibold text-slate-700 hover:text-orange-600 dark:text-slate-200 dark:hover:text-orange-500 hover:bg-orange-50\/50 dark:hover:bg-slate-900\/50 transition-all duration-200"/g,
    `className="nav-link-spiritual"`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Updated: Navbar (Premium Spiritual)');
}

// ============================================================
// 4. FOOTER - Premium Spiritual
// ============================================================
function upgradeFooter() {
  const filePath = path.join(process.cwd(), 'components', 'layouts', 'footer.tsx');
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(
    /<footer className="border-t border-border\/60 bg-muted\/30">/,
    `<footer className="footer-spiritual">`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Updated: Footer (Premium Spiritual)');
}

// ============================================================
// 5. LOGO - Premium Spiritual
// ============================================================
function upgradeLogo() {
  const filePath = path.join(process.cwd(), 'components', 'logo.tsx');
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Premium OM badge
  content = content.replace(
    /<div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl shadow-md border border-amber-200\/60 bg-white group-hover:scale-105 transition-transform">/,
    `<div className="om-badge group-hover:scale-105 transition-transform">`
  );

  content = content.replace(
    /<span className="text-white text-xl font-bold" style={{ fontFamily: 'serif' }}>ॐ<\/span>/,
    `<span className="text-white text-2xl font-bold" style={{ fontFamily: 'Cinzel, serif' }}>ॐ</span>`
  );

  // Premium brand name
  content = content.replace(
    /<span className="text-\[16px\] font-black text-om-gradient tracking-wide leading-tight py-0.5" style={{ fontFamily: "'Outfit', 'Noto Sans Devanagari', sans-serif" }}>/,
    `<span className="text-[18px] font-black sacred-gradient-text tracking-wide leading-tight py-0.5" style={{ fontFamily: "'Cinzel', 'Georgia', serif" }}>`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Updated: Logo (Premium Spiritual)');
}

// ============================================================
// 6. ADD OM FAVICON & METADATA
// ============================================================
function addMetadata() {
  const filePath = path.join(process.cwd(), 'app', 'layout.tsx');
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Add spiritual metadata if not present
  if (!content.includes('metadataBase')) {
    const metadata = `
export const metadata = {
  title: {
    default: 'Divyayagyam - Online Puja & Sanatan Seva',
    template: '%s | Divyayagyam'
  },
  description: 'Experience authentic Vedic rituals, online pujas, and spiritual guidance from India\\'s most sacred temples. Book pujas, offer chadhawa, and receive blessed prasad.',
  keywords: ['online puja', 'sanatan seva', 'vedic rituals', 'temple booking', 'chadhawa', 'astrology', 'kundali', 'spiritual guidance'],
  authors: [{ name: 'Divyayagyam Team' }],
  creator: 'Divyayagyam',
  publisher: 'Divyayagyam',
  metadataBase: new URL('https://801.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Divyayagyam - Online Puja & Sanatan Seva',
    description: 'Experience authentic Vedic rituals, online pujas, and spiritual guidance.',
    url: 'https://801.vercel.app',
    siteName: 'Divyayagyam',
    locale: 'hi_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Divyayagyam - Online Puja & Sanatan Seva',
    description: 'Experience authentic Vedic rituals, online pujas, and spiritual guidance.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};`;

    // Insert after imports
    const lines = content.split('\n');
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import')) {
        insertIndex = i + 1;
      } else if (insertIndex > 0 && !lines[i].startsWith('import')) {
        break;
      }
    }
    lines.splice(insertIndex, 0, metadata);
    content = lines.join('\n');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Added: Spiritual Metadata');
  }
}

// ============================================================
// EXECUTE ALL UPGRADES
// ============================================================

console.log('🎨 Upgrading UI to Professional Spiritual Theme...\n');

upgradeGlobals();
upgradeHomepage();
upgradeNavbar();
upgradeFooter();
upgradeLogo();
addMetadata();

console.log('\n✅ UI Upgrade Complete!');
console.log('\n🚀 NEXT STEPS:');
console.log('1. Run: npm run build');
console.log('2. Run: npm run dev');
console.log('3. Visit: http://localhost:3000');
console.log('\n🎨 NEW DESIGN FEATURES:');
console.log('  🕉️ Sacred OM gradients & decorations');
console.log('  ✨ Premium card designs with glow effects');
console.log('  🎯 Professional typography (Cinzel + Outfit)');
console.log('  🌟 Divine color palette (Saffron, Sindoor, Gold)');
console.log('  📱 Fully responsive spiritual design');
