import { prisma } from '@/lib/prisma'

// Module-level flag to avoid running on every request (only once per cold start)
let _defaultsEnsured = false

export async function ensureDefaultCategoriesAndTemples() {
  if (_defaultsEnsured) return
  _defaultsEnsured = true

  try {
    const defaultPujaCats = [
      { id: 'shiva', name: 'Shiva Pujas', slug: 'shiva', description: 'Sacred rituals dedicated to Lord Shiva' },
      { id: 'devi', name: 'Devi Pujas', slug: 'devi', description: 'Shakti and Durga Puja rituals' },
      { id: 'vishnu', name: 'Vishnu Pujas', slug: 'vishnu', description: 'Rituals dedicated to Lord Vishnu, Laxmi, and Krishna' },
      { id: 'ganesh', name: 'Ganesh Pujas', slug: 'ganesh', description: 'Obstacle-removing pujas for Lord Ganesha' },
      { id: 'navagraha', name: 'Navagraha', slug: 'navagraha', description: 'Planetary peace and dosha shanti pujas' }
    ]

    const defaultProductCats = [
      { id: 'prasad', name: 'Prasad', slug: 'prasad', description: 'Holy offerings and dry fruits prasad' },
      { id: 'rudraksha', name: 'Rudraksha', slug: 'rudraksha', description: 'Authentic Himalayan rudraksha beads and malas' },
      { id: 'idols', name: 'Idols', slug: 'idols', description: 'Beautiful brass and marble deities' },
      { id: 'books', name: 'Spiritual Books', slug: 'books', description: 'Bhagavad Gita, Puranas, and chalisa books' }
    ]

    const defaultTemples = [
      { id: 'kashi', name: 'Kashi Vishwanath', slug: 'kashi', deity: 'Shiva', city: 'Varanasi', state: 'Uttar Pradesh', address: 'Lahori Tola, Varanasi', isFeatured: true },
      { id: 'somnath', name: 'Somnath Temple', slug: 'somnath', deity: 'Shiva', city: 'Veraval', state: 'Gujarat', address: 'Prabhas Patan, Somnath', isFeatured: true },
      { id: 'baidyanath', name: 'Baidyanath Dham', slug: 'baidyanath', deity: 'Shiva', city: 'Deoghar', state: 'Jharkhand', address: 'Deoghar Sadar, Deoghar', isFeatured: false },
      { id: 'mahakal', name: 'Ujjain Mahakal', slug: 'mahakal', deity: 'Shiva', city: 'Ujjain', state: 'Madhya Pradesh', address: 'Jaisinghpura, Ujjain', isFeatured: true }
    ]

    // Run all upserts in parallel — no more sequential loops!
    await Promise.all([
      // Puja categories
      ...defaultPujaCats.map(cat =>
        prisma.pujaCategory.upsert({
          where: { slug: cat.slug },
          create: { id: cat.id, name: cat.name, slug: cat.slug, description: cat.description, isActive: true },
          update: {}
        })
      ),
      // Product categories
      ...defaultProductCats.map(cat =>
        prisma.productCategory.upsert({
          where: { slug: cat.slug },
          create: { id: cat.id, name: cat.name, slug: cat.slug, description: cat.description, isActive: true },
          update: {}
        })
      ),
      // Temples
      ...defaultTemples.map(t =>
        prisma.temple.upsert({
          where: { slug: t.slug },
          create: { id: t.id, name: t.name, slug: t.slug, deity: t.deity, city: t.city, state: t.state, address: t.address, isFeatured: t.isFeatured, isActive: true },
          update: {}
        })
      ),
    ])
  } catch (error) {
// console.error('[DataDefaults] Error initializing defaults:', error) (removed for production)
    // Reset flag so it retries next time if it failed
    _defaultsEnsured = false
  }
}
