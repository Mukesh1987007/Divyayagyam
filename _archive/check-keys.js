const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const keys = await prisma.websiteSetting.findMany({
    where: { key: { startsWith: 'secret' } }
  });
  console.log('Secrets found:', keys.map(k => ({ key: k.key, value: k.value.substring(0, 10) + '...' })));
}
check().finally(() => prisma.$disconnect());
