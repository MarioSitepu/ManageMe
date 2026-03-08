const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    const users = await prisma.user.findMany({
        select: {
            email: true,
            phoneNumber: true
        }
    });

    console.log(JSON.stringify(users, null, 2));
    await prisma.$disconnect();
}
checkUser();
