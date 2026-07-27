const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const images = await prisma.gallery.findMany();
  console.log(images);
}
main().catch(console.error).finally(() => prisma.$disconnect());
