const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// 1. Setup local env safety fallback if needed
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('[Setup] Creating fallback .env file for localhost...');
  fs.writeFileSync(envPath, 'DATABASE_URL="postgresql://postgres:postgrespassword108@localhost:5432/devyajnam_local?schema=public"\nDIRECT_URL="postgresql://postgres:postgrespassword108@localhost:5432/devyajnam_local?schema=public"\n');
}

// 2. Identify Host OS Platform
const platform = process.platform;
console.log(`[OS Detected] ${platform.toUpperCase()}`);

// 3. Connect & Check Database
async function runAutoHeal() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword108@localhost:5432/devyajnam_local?schema=public'
      }
    }
  });

  try {
    console.log('[Step 1/4] Testing PostgreSQL Connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('[SUCCESS] Database is connected and reachable!');
  } catch (err) {
    console.log('[ERROR] Cannot reach database. Starting local PostgreSQL service...');
    
    // Attempt Auto-start based on Platform
    try {
      if (platform === 'win32') {
        console.log('Running Service Start for Windows...');
        // Runs Windows Service launch for PostgreSQL (requires administrative shell context)
        execSync('net start postgresql-x64-15 || net start postgresql-x64-16', { stdio: 'inherit' });
      } else if (platform === 'darwin') {
        console.log('Running brew services start for macOS...');
        execSync('brew services start postgresql@15 || brew services start postgresql', { stdio: 'inherit' });
      } else {
        console.log('Running systemctl start for Linux...');
        execSync('sudo systemctl start postgresql', { stdio: 'inherit' });
      }
      
      console.log('Dispatched start command. Waiting 5s for database to initialize...');
      await new Promise(res => setTimeout(res, 5000));
    } catch (startErr) {
      console.error('[CRITICAL] Failed to automatically start PostgreSQL service. Please verify PostgreSQL is installed locally.', startErr.message);
      process.exit(1);
    }
  }

  // 4. Run Prisma db push to generate schemas
  try {
    console.log('[Step 3/4] Running Prisma DB Push schema sync...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('[SUCCESS] Database schemas created and synchronized!');
  } catch (migErr) {
    console.error('[CRITICAL] Schema generation/push failed.', migErr.message);
  }

  // 5. Test FindUnique Query execution
  try {
    console.log('[Step 4/4] Testing database records findUnique query...');
    const usersCount = await prisma.user.count();
    console.log(`[SUCCESS] Database query execute successfully. Users count: ${usersCount}`);
  } catch (queryErr) {
    console.error('[ERROR] Failed executing test query.', queryErr.message);
  } finally {
    await prisma.$disconnect();
  }
}

runAutoHeal();
