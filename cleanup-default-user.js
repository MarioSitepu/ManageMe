const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanUp() {
    await prisma.user.updateMany({
        where: { id: 'default-user' },
        data: { phoneNumber: null }
    });
    console.log('Cleaned up default-user phone number');
    await prisma.$disconnect();
}
cleanUp();
