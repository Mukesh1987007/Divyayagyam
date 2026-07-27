const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const STATIC_TOOLS = [
  {
    name: 'Free Kundali (Birth Chart)',
    slug: 'kundali',
    description: 'Generate your detailed Vedic birth chart with planetary positions, doshas, and predictions.',
    isActive: true,
    isFree: true,
    price: 0,
    trialDays: 0,
  },
  {
    name: 'Today\'s Panchang',
    slug: 'panchang',
    description: 'Check daily Hindu calendar with Tithi, Nakshatra, Yoga, Karana, and auspicious timings.',
    isActive: true,
    isFree: true,
    price: 0,
    trialDays: 0,
  },
  {
    name: 'Kundali Milan',
    slug: 'milan',
    description: 'Check compatibility for marriage with detailed Ashtakoot Guna Milan analysis.',
    isActive: true,
    isFree: false,
    price: 199,
    trialDays: 1,
  },
  {
    name: 'Auspicious Muhurat',
    slug: 'muhurat',
    description: 'Find the most auspicious time (Shubh Muhurat) for marriage, vehicle purchase, and events.',
    isActive: true,
    isFree: false,
    price: 99,
    trialDays: 1,
  }
];

async function main() {
  for (const tool of STATIC_TOOLS) {
    const existing = await prisma.spiritualTool.findUnique({ where: { slug: tool.slug } });
    if (!existing) {
      await prisma.spiritualTool.create({ data: tool });
      console.log(`Created tool: ${tool.name}`);
    } else {
      console.log(`Tool already exists: ${tool.name}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
