const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    const users = await prisma.user.findMany({
        select: {
            username: true,
            email: true,
            password: true
        }
    });

    console.log('--- ALL USERS IN DB ---');
    console.log(JSON.stringify(users, null, 2));
    await prisma.$disconnect();
}

checkUser();
