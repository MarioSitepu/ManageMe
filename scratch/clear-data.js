const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearData() {
    console.log('--- Clearing Database Data (Keeping Users) ---');
    
    try {
        // Delete in order to avoid FK issues if necessary (though Cascade is usually set)
        const habits = await prisma.habit.deleteMany({});
        console.log(`Deleted ${habits.count} habits`);

        const dailyNotes = await prisma.dailyNote.deleteMany({});
        console.log(`Deleted ${dailyNotes.count} daily notes`);

        const todos = await prisma.todo.deleteMany({});
        console.log(`Deleted ${todos.count} todos`);

        const events = await prisma.event.deleteMany({});
        console.log(`Deleted ${events.count} events`);

        const expenses = await prisma.expense.deleteMany({});
        console.log(`Deleted ${expenses.count} expenses`);

        const accounts = await prisma.account.deleteMany({});
        console.log(`Deleted ${accounts.count} accounts`);

        // Reset user stats but keep the users
        const users = await prisma.user.updateMany({
            data: {
                disciplinePoints: 0,
                streakDays: 0,
                // keep dailyBudget, phoneNumber, and google tokens as they are "login/config info"
            }
        });
        console.log(`Reset stats for ${users.count} users`);

        console.log('\n✅ Database cleanup successful!');
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearData();
