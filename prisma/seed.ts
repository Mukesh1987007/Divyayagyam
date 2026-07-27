import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { DEFAULT_PERMISSIONS, ROLES } from '../lib/rbac'

const prisma = new PrismaClient()

async function main() {
  console.log('🌼 Seeding Divyayagyam database...')

  // ------------------------------
  // 1. Roles & Permissions
  // ------------------------------
  const rolesData = [
    { name: 'Super Admin', slug: ROLES.SUPER_ADMIN, description: 'Full system access', isSystem: true },
    { name: 'Admin', slug: ROLES.ADMIN, description: 'Manage platform', isSystem: true },
    { name: 'Temple Manager', slug: ROLES.TEMPLE_MANAGER, description: 'Temple & puja mgmt', isSystem: true },
    { name: 'Pandit Manager', slug: ROLES.PANDIT_MANAGER, description: 'Pandit & schedule mgmt', isSystem: true },
    { name: 'Store Manager', slug: ROLES.STORE_MANAGER, description: 'Products & orders', isSystem: true },
    { name: 'Content Manager', slug: ROLES.CONTENT_MANAGER, description: 'Blog, CMS, SEO', isSystem: true },
    { name: 'Support Manager', slug: ROLES.SUPPORT_MANAGER, description: 'Tickets & customer help', isSystem: true },
    { name: 'Finance Manager', slug: ROLES.FINANCE_MANAGER, description: 'Payments, refunds, reports', isSystem: true },
    { name: 'Marketing Manager', slug: ROLES.MARKETING_MANAGER, description: 'Campaigns & offers', isSystem: true },
    { name: 'Pandit', slug: ROLES.PANDIT, description: 'Certified priest', isSystem: true },
    { name: 'Staff', slug: ROLES.STAFF, description: 'Support & ops', isSystem: true },
    { name: 'Devotee', slug: ROLES.DEVOTEE, description: 'Customer', isSystem: true },
  ]

  const roles: Record<string, string> = {}
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { slug: r.slug },
      create: r,
      update: { name: r.name, description: r.description },
    })
    roles[r.slug] = role.id
  }
  console.log(`  ✓ ${rolesData.length} roles`)

  // Permissions (unique set from DEFAULT_PERMISSIONS values)
  const permSet = new Set<string>()
  Object.values(DEFAULT_PERMISSIONS).forEach((arr) => arr.forEach((p) => permSet.add(p)))
  permSet.add('*')
  const permissionIds: Record<string, string> = {}
  for (const p of permSet) {
    const [resource, action] = p.split('.')
    const perm = await prisma.permission.upsert({
      where: { slug: p },
      create: { name: p, slug: p, resource: resource || 'system', action: action || '*' },
      update: {},
    })
    permissionIds[p] = perm.id
  }
  console.log(`  ✓ ${permSet.size} permissions`)

  for (const [slug, perms] of Object.entries(DEFAULT_PERMISSIONS)) {
    const roleId = roles[slug]
    for (const p of perms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId: permissionIds[p] } },
        create: { roleId, permissionId: permissionIds[p] },
        update: {},
      })
    }
  }
  console.log('  ✓ Role permissions mapped')

  // ------------------------------
  // 2. Super admin user
  // ------------------------------
  const superAdminEmail = 'admin@divyayagyam.com'
  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    create: {
      email: superAdminEmail,
      passwordHash: await bcrypt.hash('Admin@12345', 10),
      fullName: 'Divyayagyam Admin',
      firstName: 'Divyayagyam',
      lastName: 'Admin',
      emailVerified: true,
      roleId: roles[ROLES.SUPER_ADMIN],
    },
    update: { roleId: roles[ROLES.SUPER_ADMIN] },
  })
  console.log(`  ✓ Super admin: ${superAdminEmail} / Admin@12345`)

  // ------------------------------
  // 3. Puja Categories
  // ------------------------------
  const pujaCats = [
    { name: 'Shiva Pujas', slug: 'shiva-pujas' },
    { name: 'Devi Pujas', slug: 'devi-pujas' },
    { name: 'Vishnu Pujas', slug: 'vishnu-pujas' },
    { name: 'Ganesh Pujas', slug: 'ganesh-pujas' },
    { name: 'Navagraha Pujas', slug: 'navagraha-pujas' },
    { name: 'VIP Pujas', slug: 'vip-pujas' },
  ]
  const pujaCategoryIds: Record<string, string> = {}
  for (const c of pujaCats) {
    const cat = await prisma.pujaCategory.upsert({
      where: { slug: c.slug }, create: c, update: {},
    })
    pujaCategoryIds[c.slug] = cat.id
  }
  console.log(`  ✓ ${pujaCats.length} puja categories`)

  // ------------------------------
  // 4. Temples
  // ------------------------------
  const temples = [
    { name: 'Kashi Vishwanath', slug: 'kashi-vishwanath', deity: 'Lord Shiva', city: 'Varanasi', state: 'Uttar Pradesh' },
    { name: 'Somnath Temple', slug: 'somnath', deity: 'Lord Shiva', city: 'Somnath', state: 'Gujarat' },
    { name: 'Baidyanath Dham', slug: 'baidyanath-dham', deity: 'Lord Shiva', city: 'Deoghar', state: 'Jharkhand' },
    { name: 'Ujjain Mahakaleshwar', slug: 'mahakaleshwar', deity: 'Lord Shiva', city: 'Ujjain', state: 'Madhya Pradesh' },
    { name: 'Tirupati Balaji', slug: 'tirupati', deity: 'Lord Vishnu', city: 'Tirupati', state: 'Andhra Pradesh' },
  ]
  const templeIds: Record<string, string> = {}
  for (const t of temples) {
    const temp = await prisma.temple.upsert({
      where: { slug: t.slug }, create: { ...t, country: 'India', isFeatured: true }, update: {},
    })
    templeIds[t.slug] = temp.id
  }
  console.log(`  ✓ ${temples.length} temples`)

  // ------------------------------
  // 5. Sample Pujas
  // ------------------------------
  const pujas = [
    { name: 'Maha Rudrabhishek', slug: 'maha-rudrabhishek', categoryId: pujaCategoryIds['shiva-pujas'], templeId: templeIds['kashi-vishwanath'], price: 1100, vipPrice: 5100, isVip: true, isOnline: true },
    { name: 'Sawan Somvar Puja', slug: 'sawan-somvar-puja', categoryId: pujaCategoryIds['shiva-pujas'], templeId: templeIds['baidyanath-dham'], price: 851, isOnline: true },
    { name: 'Lakshmi Kuber Puja', slug: 'lakshmi-kuber-puja', categoryId: pujaCategoryIds['devi-pujas'], templeId: templeIds['tirupati'], price: 1251, isOnline: true },
    { name: 'Ganesh Chaturthi Puja', slug: 'ganesh-chaturthi', categoryId: pujaCategoryIds['ganesh-pujas'], templeId: templeIds['somnath'], price: 999, isOnline: true },
    { name: 'Shani Shanti Puja', slug: 'shani-shanti', categoryId: pujaCategoryIds['navagraha-pujas'], templeId: templeIds['mahakaleshwar'], price: 2100, isOnline: true },
  ]
  for (const p of pujas) {
    await prisma.puja.upsert({
      where: { slug: p.slug },
      create: { ...p, description: `Sacred ${p.name} performed by learned pandits.`, status: 'PUBLISHED', isFeatured: true },
      update: {},
    })
  }
  console.log(`  ✓ ${pujas.length} pujas`)

  // ------------------------------
  // 6. Product Categories & Products
  // ------------------------------
  const prodCats = [
    { name: 'Prasad', slug: 'prasad' },
    { name: 'Rudraksha', slug: 'rudraksha' },
    { name: 'Idols & Murtis', slug: 'idols-murtis' },
    { name: 'Puja Samagri', slug: 'puja-samagri' },
    { name: 'Books', slug: 'books' },
  ]
  const productCategoryIds: Record<string, string> = {}
  for (const c of prodCats) {
    const cat = await prisma.productCategory.upsert({ where: { slug: c.slug }, create: c, update: {} })
    productCategoryIds[c.slug] = cat.id
  }
  console.log(`  ✓ ${prodCats.length} product categories`)

  const products = [
    { name: '5 Mukhi Rudraksha (Certified)', slug: '5-mukhi-rudraksha', categoryId: productCategoryIds['rudraksha'], price: 501, salePrice: 351, isAbhimantrit: true },
    { name: 'Kashi Vishwanath Prasad', slug: 'kashi-prasad', categoryId: productCategoryIds['prasad'], price: 251, isAbhimantrit: true },
    { name: 'Ganesh Idol (Brass)', slug: 'ganesh-idol-brass', categoryId: productCategoryIds['idols-murtis'], price: 1899 },
    { name: 'Complete Puja Samagri Kit', slug: 'puja-samagri-kit', categoryId: productCategoryIds['puja-samagri'], price: 799 },
    { name: 'Shiv Puran (Hardcover)', slug: 'shiv-puran', categoryId: productCategoryIds['books'], price: 499 },
  ]
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: { ...p, status: 'ACTIVE', isFeatured: true, description: `Blessed ${p.name} — authentic and abhimantrit.` },
      update: {},
    })
  }
  console.log(`  ✓ ${products.length} products`)

  // ------------------------------
  // 7. Donation categories & campaign
  // ------------------------------
  const donCats = [
    { name: 'Temple Donation', slug: 'temple-donation' },
    { name: 'Gaushala', slug: 'gaushala' },
    { name: 'Annadan', slug: 'annadan' },
    { name: 'Gurukul', slug: 'gurukul' },
    { name: 'General', slug: 'general' },
  ]
  const donCategoryIds: Record<string, string> = {}
  for (const c of donCats) {
    const cat = await prisma.donationCategory.upsert({ where: { slug: c.slug }, create: c, update: {} })
    donCategoryIds[c.slug] = cat.id
  }
  await prisma.donationCampaign.upsert({
    where: { slug: 'save-cows-2025' },
    create: {
      categoryId: donCategoryIds['gaushala'],
      title: 'Save 1000 Cows Campaign',
      slug: 'save-cows-2025',
      description: 'Help us feed and care for 1000 rescued cows across our gaushalas.',
      target: 500000,
      isFeatured: true,
    },
    update: {},
  })
  console.log(`  ✓ ${donCats.length} donation categories + 1 campaign`)

  // ------------------------------
  // 8. Blog category & sample
  // ------------------------------
  const bc = await prisma.blogCategory.upsert({
    where: { slug: 'spirituality' }, create: { name: 'Spirituality', slug: 'spirituality' }, update: {},
  })
  await prisma.blog.upsert({
    where: { slug: 'welcome-to-divyayagyam' },
    create: {
      categoryId: bc.id,
      authorId: superAdmin.id,
      title: 'Welcome to Divyayagyam',
      slug: 'welcome-to-divyayagyam',
      excerpt: 'Your gateway to sacred pujas, blessed prasad, and spiritual services.',
      content: '# Welcome\n\nDivyayagyam bridges devotion with technology.',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
    update: {},
  })
  console.log('  ✓ Blog seed')

  // ------------------------------
  // 9. FAQs, Testimonials, Hero, Settings
  // ------------------------------
  const faqs = [
    { question: 'How does online puja work?', answer: 'Book online, share your sankalp details, watch the puja live, and receive prasad by courier.', order: 1 },
    { question: 'Are the pandits verified?', answer: 'Yes, all our pandits are certified and verified by our team.', order: 2 },
    { question: 'How long does prasad delivery take?', answer: 'Usually 3–7 business days across India.', order: 3 },
    { question: 'Can I get a donation receipt?', answer: 'Yes, digital receipts are emailed instantly. 80G is coming soon.', order: 4 },
  ]
  for (const f of faqs) {
    await prisma.fAQ.create({ data: f }).catch(() => null)
  }

  const testimonials = [
    { name: 'Anjali Sharma', location: 'Mumbai', rating: 5, message: 'The puja was conducted with such devotion. Received prasad within a week!', isFeatured: true },
    { name: 'Rajesh Kumar', location: 'Delhi', rating: 5, message: 'Video quality was superb. Felt like being at the temple.', isFeatured: true },
    { name: 'Priya Nair', location: 'Bangalore', rating: 5, message: 'Excellent service and authentic pandits.', isFeatured: true },
  ]
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t }).catch(() => null)
  }

  const heroes = [
    { title: 'Book Sacred Pujas Online', subtitle: 'Live streamed from India’s most powerful temples', image: '/hero-1.jpg', ctaText: 'Explore Pujas', ctaUrl: '/pujas', order: 1 },
    { title: 'Offer BhaktiSeva from Home', subtitle: 'Flowers, prasad, bhog & deep daan', image: '/hero-2.jpg', ctaText: 'Offer Now', ctaUrl: '/bhaktiseva', order: 2 },
  ]
  for (const h of heroes) {
    await prisma.heroSlider.create({ data: h }).catch(() => null)
  }

  const settings = [
    { key: 'site.name', value: 'Divyayagyam', group: 'general' },
    { key: 'site.tagline', value: 'Sanatan Seva Online', group: 'general' },
    { key: 'payment.currency', value: 'INR', group: 'payment' },
    { key: 'contact.email', value: 'seva@divyayagyam.com', group: 'contact' },
  ]
  for (const s of settings) {
    await prisma.websiteSetting.upsert({
      where: { key: s.key }, create: s, update: { value: s.value },
    })
  }

  console.log('✅ Seed complete!')
  console.log('   🔑 Admin login: admin@divyayagyam.com / Admin@12345')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
