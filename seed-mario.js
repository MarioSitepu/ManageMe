const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = 'sitepu88';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('Seeding user mario...');
  
  const user = await prisma.user.upsert({
    where: { username: 'mario' },
    update: {
      password: hashedPassword,
      name: 'Mario',
      email: 'mario@trackme.com'
    },
    create: {
      username: 'mario',
      email: 'mario@trackme.com',
      password: hashedPassword,
      name: 'Mario'
    }
  });
  
  console.log('✅ User mario seeded/updated successfully:', user.username);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
