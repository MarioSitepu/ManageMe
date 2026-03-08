const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        console.log('--- Testing Database User Lookup ---');
        let user = await prisma.user.findFirst({ where: { phoneNumber: { not: null } } });
        if (!user) {
            console.log('No user found, creating one...');
            user = await prisma.user.create({
                data: {
                    email: 'test_user_' + Date.now() + '@test.com',
                    phoneNumber: '085712345678'
                }
            });
        }

        console.log('User in DB:', user.email, '| Phone:', user.phoneNumber);

        // Fonnte always sends international format without +, e.g. 6285712345678
        let simulatedFonntePhone = user.phoneNumber;
        if (simulatedFonntePhone.startsWith('0')) {
            simulatedFonntePhone = '62' + simulatedFonntePhone.substring(1);
        }
        console.log('Simulated Fonnte Input:', simulatedFonntePhone);

        // This is the EXACT code from route.ts
        const cleanPhone = simulatedFonntePhone.replace(/\D/g, '');
        const phoneSuffix = cleanPhone.startsWith('62') ? cleanPhone.substring(2)
            : cleanPhone.startsWith('0') ? cleanPhone.substring(1)
                : cleanPhone;

        console.log('Searching for Suffix Suffix:', phoneSuffix);

        const foundUser = await prisma.user.findFirst({
            where: {
                phoneNumber: {
                    endsWith: phoneSuffix
                }
            }
        });

        if (foundUser && foundUser.id === user.id) {
            console.log('✅ Webhook Logic SUCCESS! Found correct user:', foundUser.email);
        } else {
            console.log('❌ Webhook Logic FAILED! Found:', foundUser ? foundUser.email : 'None');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
test();
