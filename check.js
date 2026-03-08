const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function checkPhone() {
    const users = await prisma.user.findMany({ select: { id: true, email: true, phoneNumber: true } });
    fs.writeFileSync('users-db.json', JSON.stringify(users, null, 2), 'utf-8');
    console.log('Done writing users-db.json');
    await prisma.$disconnect();
}

checkPhone().catch(console.error);
