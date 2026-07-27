// Complete admin sidebar with Customizer added
import {
  LayoutDashboard, BarChart3, Users, Star, HeartHandshake, Wrench,
  Building2, Flame, Ticket, ShoppingBag, HandCoins, Sparkles, Sparkle,
  Newspaper, ImageIcon, MessageSquare, Bell, Megaphone, LineChart,
  Palette, Search, CreditCard, HardDrive, Settings, Lock, DatabaseBackup,
  Code2, Bot, FileText, Package, ClipboardList, Layers, CalendarDays, Wand2,
} from 'lucide-react'

export type AdminNavItem = { title: string; href: string; icon?: any; badge?: string | number }
export type AdminNavSection = { title: string; icon: any; slug: string; href?: string; items?: AdminNavItem[]; permission?: string }

export const ADMIN_NAV: AdminNavSection[] = [
  { title: 'Dashboard', slug: 'dashboard', icon: LayoutDashboard, href: '/admin' },
  { title: 'User Management', slug: 'users', icon: Users, permission: 'user.read', items: [
    { title: 'All Users', href: '/admin/users' }, { title: 'Customers', href: '/admin/customers' },
    { title: 'Sub-Admins', href: '/admin/users/admins' }, { title: 'Pandits', href: '/admin/users?tab=pandits' },
    { title: 'Volunteers', href: '/admin/users?tab=volunteers' }, { title: 'Roles', href: '/admin/users/roles' },
    { title: 'Permissions', href: '/admin/users/permissions' }, { title: 'Login History', href: '/admin/users/activity' },
  ]},

  { title: 'Puja Management', slug: 'pujas', icon: Flame, permission: 'puja.read', items: [
    { title: 'All Pujas', href: '/admin/pujas' }, { title: 'Add Puja', href: '/admin/pujas/new' },
    { title: 'Categories', href: '/admin/pujas/categories' }, { title: 'Featured', href: '/admin/pujas?tab=featured' },
    { title: 'VIP Pujas', href: '/admin/pujas?tab=vip' }, { title: 'Upcoming', href: '/admin/pujas?tab=upcoming' },
    { title: 'Live', href: '/admin/pujas?tab=live' }, { title: 'Time Slots', href: '/admin/pujas/slots' },
  ]},
  { title: 'Bookings', slug: 'bookings', icon: Ticket, permission: 'booking.read', items: [
    { title: 'All', href: '/admin/bookings' }, { title: 'Pending', href: '/admin/bookings?tab=pending' },
    { title: 'Confirmed', href: '/admin/bookings?tab=confirmed' }, { title: 'Completed', href: '/admin/bookings?tab=completed' },
    { title: 'Cancelled', href: '/admin/bookings?tab=cancelled' }, { title: 'Refund Requests', href: '/admin/bookings?tab=refunds' },
  ]},
  { title: 'Customers', slug: 'customers', icon: HeartHandshake, href: '/admin/customers', permission: 'user.read' },
  { title: 'Products', slug: 'products', icon: ShoppingBag, permission: 'product.read', items: [
    { title: 'All Products', href: '/admin/products' }, { title: 'Add Product', href: '/admin/products/new' },
    { title: 'Categories', href: '/admin/products/categories' }, { title: 'Inventory', href: '/admin/products/inventory' },
    { title: 'Reviews', href: '/admin/products?tab=reviews' }, { title: 'Coupons', href: '/admin/marketing/coupons' },
  ]},
  { title: 'Orders', slug: 'orders', icon: Package, permission: 'order.read', items: [
    { title: 'All', href: '/admin/orders' }, { title: 'Pending', href: '/admin/orders?tab=pending' },
    { title: 'Processing', href: '/admin/orders?tab=processing' }, { title: 'Shipped', href: '/admin/orders?tab=shipped' },
    { title: 'Delivered', href: '/admin/orders?tab=delivered' }, { title: 'Cancelled', href: '/admin/orders?tab=cancelled' },
    { title: 'Returned', href: '/admin/orders?tab=returned' }, { title: 'Refunds', href: '/admin/orders?tab=refunds' },
  ]},

  { title: 'BhaktiSeva', slug: 'bhaktiSeva', icon: Sparkles, permission: 'bhaktiSeva.read', items: [
    { title: 'All', href: '/admin/bhaktiseva' }, { title: 'Flowers', href: '/admin/bhaktiseva?tab=flowers' },
    { title: 'Prasad', href: '/admin/bhaktiseva?tab=prasad' }, { title: 'Bhog', href: '/admin/bhaktiseva?tab=bhog' },
    { title: 'Deep Daan', href: '/admin/bhaktiseva?tab=deep-daan' }, { title: 'Gau Seva', href: '/admin/bhaktiseva?tab=gau-seva' },
  ]},
  { title: 'Blog & CMS', slug: 'blog', icon: Newspaper, permission: 'blog.read', items: [
    { title: 'All Posts', href: '/admin/blog' }, { title: 'Add New', href: '/admin/blog/new' },
    { title: 'Categories', href: '/admin/blog/categories' }, { title: 'Comments', href: '/admin/blog/comments' },
  ]},
  { title: 'Tools Manager', slug: 'tools', icon: Wrench, items: [
    { title: 'All Tools', href: '/admin/tools' }, { title: 'Add New Tool', href: '/admin/tools/new' },
  ]},
  { title: 'Gallery', slug: 'gallery', icon: ImageIcon, href: '/admin/gallery', permission: 'gallery.read' },
  { title: 'Testimonials', slug: 'testimonials', icon: Star, href: '/admin/testimonials', permission: 'testimonial.read' },
  { title: 'Events', slug: 'events', icon: CalendarDays, href: '/admin/events', permission: 'event.read' },
  { title: 'Media Library', slug: 'media', icon: Layers, href: '/admin/media', permission: 'media.read' },
  { title: 'Support', slug: 'support', icon: MessageSquare, href: '/admin/support', permission: 'support.read' },
  { title: 'Notifications', slug: 'notifications', icon: Bell, href: '/admin/notifications', permission: 'notification.read' },
  { title: 'CMS', slug: 'cms', icon: ClipboardList, permission: 'cms.read', items: [
    { title: 'Homepage', href: '/admin/cms' }, { title: 'Hero Slider', href: '/admin/cms/hero' },
    { title: 'Product Slider', href: '/admin/cms/hero-products' },
    { title: 'Custom Pages', href: '/admin/cms/pages' },
  ]},
  { title: '🎨 Customizer', slug: 'customizer', icon: Wand2, permission: 'cms.update', items: [
    { title: 'Global CSS', href: '/admin/customizer?tab=global' },
    { title: 'Global JS', href: '/admin/customizer?tab=js' },
    { title: 'Per-Page', href: '/admin/customizer?tab=page' },
    { title: 'Live Preview', href: '/admin/customizer?tab=preview' },
  ]},
  { title: 'SEO', slug: 'seo', icon: Search, href: '/admin/seo', permission: 'seo.read' },
  { title: 'Payment Settings', slug: 'payments', icon: CreditCard, href: '/admin/payments', permission: 'payment.read' },
  { title: 'Storage', slug: 'storage', icon: HardDrive, href: '/admin/storage', permission: 'storage.read' },
  { title: 'Website Settings', slug: 'settings', icon: Palette, href: '/admin/settings', permission: 'settings.read' },
]
