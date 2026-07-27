const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({ select: { id: true, name: true, coverImage: true } });
  const pujas = await prisma.puja.findMany({ select: { id: true, name: true, coverImage: true } });
  console.log('Products:', products);
  console.log('Pujas:', pujas);
}
main().catch(console.error).finally(() => prisma.$disconnect());
