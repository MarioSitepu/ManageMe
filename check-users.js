const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    const users = await prisma.user.findMany({
        select: {
            email: true,
            username: true,
            phoneNumber: true
        }
    });

    console.log('--- ALL USERS IN DB ---');
    console.table(users);
    await prisma.$disconnect();
}

checkUser();
