import { unstable_cache } from 'next/cache'
import { prisma } from './prisma'

// Cache public published pujas list
export const getCachedPujas = unstable_cache(
  async () => {
    try {
// console.log('[DATABASE QUERY] Fetching published pujas list (Cache Miss)...') (removed for production)
      const pujas = await prisma.puja.findMany({
        where: { 
          status: 'PUBLISHED',
          OR: [
            { publishedAt: null },
            { publishedAt: { lte: new Date() } }
          ]
        },
        select: {
          id: true,
          name: true,
          slug: true,
          coverImage: true,
          price: true,
          isVip: true,
          isOnline: true,
          location: true,
          shortDescription: true,
          category: {
            select: {
              id: true,
              name: true
            }
          },
          temple: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      
      // Convert decimal price to string or number to prevent serialisation issues in NextJS server actions/caching
      return pujas.map(p => ({
        ...p,
        price: Number(p.price)
      }))
    } catch (err) {
// console.error('[CACHE ERROR] Failed to fetch pujas from database, returning empty list:', err) (removed for production)
      return []
    }
  },
  ['public-pujas-list'],
  {
    revalidate: 3600, // Cache for up to 1 hour
    tags: ['pujas']   // Revalidate tag
  }
)
