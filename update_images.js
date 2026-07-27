const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const productImages = {
  '5 Mukhi Rudraksha (Certified)': 'https://images.unsplash.com/photo-1601004245648-52264eb86214?w=800&auto=format&fit=crop',
  'Kashi Vishwanath Prasad': 'https://images.unsplash.com/photo-1590059530514-616110f8a846?w=800&auto=format&fit=crop',
  'Ganesh Idol (Brass)': 'https://images.unsplash.com/photo-1566861298836-39ce6b251025?w=800&auto=format&fit=crop',
  'Complete Puja Samagri Kit': 'https://images.unsplash.com/photo-1605980004945-38c35bb5fae9?w=800&auto=format&fit=crop',
  'e mala': 'https://images.unsplash.com/photo-1601004245648-52264eb86214?w=800&auto=format&fit=crop'
};

const pujaImages = {
  'Maha Rudrabhishek': 'https://images.unsplash.com/photo-1587840131464-a6c8e0ad799f?w=800&auto=format&fit=crop',
  'Sawan Somvar Puja': 'https://images.unsplash.com/photo-1601815160867-27b5fc7bdc9a?w=800&auto=format&fit=crop',
  'Lakshmi Kuber Puja': 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&auto=format&fit=crop',
  'Ganesh Chaturthi Puja': 'https://images.unsplash.com/photo-1565780512530-0504787d5599?w=800&auto=format&fit=crop',
  'Shani Shanti Puja': 'https://images.unsplash.com/photo-1595856983637-f82329fbba3b?w=800&auto=format&fit=crop'
};

async function main() {
  const products = await prisma.product.findMany();
  for (const p of products) {
    if (productImages[p.name]) {
      await prisma.product.update({
        where: { id: p.id },
        data: { coverImage: productImages[p.name] }
      });
      console.log(`Updated Product: ${p.name}`);
    }
  }

  const pujas = await prisma.puja.findMany();
  for (const p of pujas) {
    if (pujaImages[p.name]) {
      await prisma.puja.update({
        where: { id: p.id },
        data: { coverImage: pujaImages[p.name] }
      });
      console.log(`Updated Puja: ${p.name}`);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
