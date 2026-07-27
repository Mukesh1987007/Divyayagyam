const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const role = await prisma.role.findUnique({ where: { slug: 'admin' } });
  if (!role) return console.log('Admin role not found');
  let perm = await prisma.permission.findUnique({ where: { slug: 'tools.*' } });
  if (!perm) {
    perm = await prisma.permission.create({ data: { name: 'Tools Manage', slug: 'tools.*', resource: 'tools', action: '*' } });
  }
  const rp = await prisma.rolePermission.findFirst({ where: { roleId: role.id, permissionId: perm.id } });
  if (!rp) {
    await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: perm.id } });
    console.log('Permission added to DB');
  } else {
    console.log('Permission already exists in DB');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
