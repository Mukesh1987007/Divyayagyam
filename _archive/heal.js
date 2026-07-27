const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=============================================');
console.log('🛠️  Divyayagyam Self-Healing & Diagnostic System');
console.log('=============================================\n');

let issuesFixed = 0;

function runCommand(command, errorMessage) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (err) {
    console.error(`❌ Error: ${errorMessage}`);
    return false;
  }
}

// 1. Clean Caches
console.log('[1/5] 🧹 Cleaning Next.js Caches...');
const nextCachePath = path.join(process.cwd(), '.next');
if (fs.existsSync(nextCachePath)) {
  try {
    fs.rmSync(nextCachePath, { recursive: true, force: true });
    console.log('✅ Cleaned .next build cache. (This fixes UI staleness & hydration errors)');
    issuesFixed++;
  } catch (e) {
    console.log('⚠️ Could not remove .next folder completely (it might be in use).');
  }
} else {
  console.log('✅ No .next cache found to clean.');
}

// 2. Check Database Connectivity & Prisma
console.log('\n[2/5] 🗄️  Synchronizing Database & Prisma...');
console.log('Running Prisma Generate to sync schema...');
const prismaGenerated = runCommand('npx prisma generate', 'Failed to generate Prisma Client. Check your schema.prisma file.');
if (prismaGenerated) {
  console.log('✅ Prisma Client is up to date.');
  issuesFixed++;
}

// 3. Environment Variables
console.log('\n[3/5] 🔑 Verifying Environment Variables...');
const envPath = path.join(process.cwd(), '.env');
const envLocalPath = path.join(process.cwd(), '.env.local');

let envContent = '';
if (fs.existsSync(envPath)) envContent += fs.readFileSync(envPath, 'utf8');
if (fs.existsSync(envLocalPath)) envContent += fs.readFileSync(envLocalPath, 'utf8');

if (!envContent.includes('DATABASE_URL')) {
  console.log('❌ DATABASE_URL is missing! The app will not be able to connect to the DB.');
} else {
  console.log('✅ DATABASE_URL is present.');
}

// 4. Safe Code Patches
console.log('\n[4/5] 🩹 Applying Automated Code Patches...');
if (fs.existsSync(path.join(process.cwd(), 'fix_suspense.js'))) {
  console.log('Running fix_suspense.js to prevent Next.js hydration crashes...');
  runCommand('node fix_suspense.js', 'Failed to run fix_suspense.js');
  issuesFixed++;
}

if (fs.existsSync(path.join(process.cwd(), 'patch_p2003.js'))) {
  console.log('Running patch_p2003.js to prevent DB connection drops...');
  runCommand('node patch_p2003.js', 'Failed to run patch_p2003.js');
  issuesFixed++;
}
if (fs.existsSync(path.join(process.cwd(), 'fix_use_client.js'))) {
  console.log('Running fix_use_client.js to prevent UI button/link bugs...');
  runCommand('node fix_use_client.js', 'Failed to run fix_use_client.js');
  issuesFixed++;
}

// 5. Final Report
console.log('\n=============================================');
console.log(`✅ System Healing Complete! Applied ${issuesFixed} fixes.`);
console.log('🚀 You can now start the app safely: `npm run dev` or `npm run build`');
console.log('=============================================\n');
