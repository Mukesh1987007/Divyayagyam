const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runBackup() {
  console.log('🤖 [Robot 1] Starting Database Auto-Backup...');
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const dateStr = new Date().toISOString().split('T')[0];
  const backupPath = path.join(backupDir, `backup_${dateStr}.json`);

  try {
    // Dynamically fetch all models from Prisma to back them up
    // In a real scenario, you could use raw queries, but Prisma makes it safe
    // We will backup essential user data
    
    // Instead of querying all, let's backup core tables if they exist
    // For Divyayagyam: User, Order, Puja, Booking, Testimonial
    const backupData = {};
    
    // Using Prisma generic model access
    for (const model of ['user', 'order', 'booking', 'product', 'puja', 'testimonial']) {
      if (prisma[model]) {
        console.log(`Backing up ${model}...`);
        backupData[model] = await prisma[model].findMany();
      }
    }

    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`✅ Backup successfully saved to ${backupPath}`);
    console.log(`Size: ${(fs.statSync(backupPath).size / 1024).toFixed(2)} KB`);
  } catch (err) {
    console.error('❌ Backup Failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runBackup();
