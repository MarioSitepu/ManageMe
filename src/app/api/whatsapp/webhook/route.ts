import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
        temperature: 0.2, // Lower temperature for more consistent function calling
    }
});

// Define available functions for AI
const tools = [
    {
        functionDeclarations: [
            {
                name: 'add_expense',
                description: 'Add a new expense/pengeluaran. Use this when user wants to record spending/purchase.',
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        amount: {
                            type: 'NUMBER',
                            description: 'The amount of money spent in Rupiah'
                        },
                        category: {
                            type: 'STRING',
                            description: 'Category of expense',
                            enum: ['food', 'transport', 'shopping', 'entertainment', 'bills', 'other']
                        },
                        description: {
                            type: 'STRING',
                            description: 'Description of what was purchased or spent on'
                        }
                    },
                    required: ['amount', 'category', 'description']
                }
            },
            {
                name: 'get_balance',
                description: 'Get account balances. Use when user asks about saldo/balance/uang.',
                parameters: {
                    type: 'OBJECT',
                    properties: {}
                }
            },
            {
                name: 'get_today_expenses',
                description: 'Get today\'s expenses. Use when user asks about today\'s spending/pengeluaran hari ini.',
                parameters: {
                    type: 'OBJECT',
                    properties: {}
                }
            },
            {
                name: 'get_week_expenses',
                description: 'Get this week\'s expenses summary. Use when user asks about weekly spending.',
                parameters: {
                    type: 'OBJECT',
                    properties: {}
                }
            },
            {
                name: 'get_schedule',
                description: 'Get today\'s schedule/jadwal. Use when user asks about schedule/jadwal/kelas.',
                parameters: {
                    type: 'OBJECT',
                    properties: {}
                }
            },
            {
                name: 'show_menu',
                description: 'Show help menu with available commands. Use when user asks for help/menu/bantuan.',
                parameters: {
                    type: 'OBJECT',
                    properties: {}
                }
            }
        ]
    }
];

// Fonnte Webhook Handler
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, sender, device } = body;

        // Extract message text and sender phone
        const text = message?.trim() || '';
        const phone = sender || '';

        console.log('Received WhatsApp message:', { text, phone });

        if (!text) {
            return NextResponse.json({ success: true, response: 'Empty message' });
        }

        // Process with AI
        const response = await processWithAI(text, 'default-user');

        // Send response back via Fonnte
        if (response) {
            await sendWhatsAppReply(phone, response);
        }

        return NextResponse.json({ success: true, response });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

async function processWithAI(text: string, userId: string): Promise<string> {
    try {
        const chat = model.startChat({
            tools,
            history: []
        });

        // Send user message to AI
        const result = await chat.sendMessage(text);
        const response = result.response;

        // Check if AI wants to call a function
        const functionCalls = response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
            const functionCall = functionCalls[0];
            const functionName = functionCall.name;
            const args = functionCall.args;

            console.log('AI Function Call:', functionName, args);

            // Execute the function
            let functionResult: string;

            switch (functionName) {
                case 'add_expense':
                    functionResult = await handleAddExpense(
                        args.amount,
                        args.category,
                        args.description,
                        userId
                    );
                    break;

                case 'get_balance':
                    functionResult = await handleGetBalance(userId);
                    break;

                case 'get_today_expenses':
                    functionResult = await handleTodayExpenses(userId);
                    break;

                case 'get_week_expenses':
                    functionResult = await handleWeekExpenses(userId);
                    break;

                case 'get_schedule':
                    functionResult = await handleTodaySchedule(userId);
                    break;

                case 'show_menu':
                    functionResult = getMenuMessage();
                    break;

                default:
                    functionResult = 'Maaf, fungsi tidak dikenali.';
            }

            return functionResult;
        }

        // If no function call, return AI's text response
        const textResponse = response.text();
        return textResponse || 'Maaf, saya tidak mengerti. Ketik *menu* untuk bantuan.';

    } catch (error) {
        console.error('AI Processing error:', error);
        return 'Maaf, terjadi kesalahan. Ketik *menu* untuk bantuan.';
    }
}

function getMenuMessage(): string {
    return `🤖 *TrackMe AI Bot*

Saya bisa membantu Anda dengan bahasa natural! 💬

📝 *Contoh Perintah:*

💰 *Keuangan:*
• "Tadi beli nasi goreng 50 ribu"
• "Isi bensin 100rb"
• "Berapa sisa uang ku?"
• "Pengeluaran hari ini apa aja?"
• "Total pengeluaran minggu ini"

📅 *Jadwal:*
• "Jadwal hari ini apa?"
• "Kelas apa aja hari ini?"

💡 *Tips:* Bicara natural saja, AI akan memahami! 🚀`;
}

async function handleAddExpense(
    amount: number,
    category: string,
    description: string,
    userId: string
): Promise<string> {
    try {
        // Create expense
        await prisma.expense.create({
            data: {
                amount,
                category,
                description,
                userId,
            }
        });

        return `✅ *Pengeluaran Berhasil Dicatat!*

💵 Jumlah: Rp ${amount.toLocaleString('id-ID')}
📁 Kategori: ${category}
📝 Deskripsi: ${description}

Ketik "berapa saldo ku?" untuk cek saldo! 💰`;

    } catch (error) {
        console.error('Add expense error:', error);
        return `❌ Gagal menambahkan pengeluaran. Coba lagi nanti.`;
    }
}

async function handleGetBalance(userId: string): Promise<string> {
    try {
        const accounts = await prisma.account.findMany({
            where: { userId },
            orderBy: { balance: 'desc' }
        });

        if (accounts.length === 0) {
            return `📊 *Saldo Akun*\n\nBelum ada akun terdaftar.\nTambahkan akun melalui aplikasi web.`;
        }

        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

        let message = `💰 *Saldo Akun*\n\n`;
        accounts.forEach(acc => {
            message += `${acc.name}: Rp ${acc.balance.toLocaleString('id-ID')}\n`;
        });
        message += `\n📊 *Total:* Rp ${totalBalance.toLocaleString('id-ID')}`;

        return message;
    } catch (error) {
        console.error('Balance error:', error);
        return `❌ Gagal mengambil data saldo.`;
    }
}

async function handleTodayExpenses(userId: string): Promise<string> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expenses = await prisma.expense.findMany({
            where: {
                userId,
                date: {
                    gte: today
                }
            },
            orderBy: { date: 'desc' }
        });

        if (expenses.length === 0) {
            return `📊 *Pengeluaran Hari Ini*\n\nBelum ada pengeluaran hari ini. 🎉`;
        }

        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        let message = `📊 *Pengeluaran Hari Ini*\n\n`;
        expenses.forEach(exp => {
            message += `• ${exp.description}\n  Rp ${exp.amount.toLocaleString('id-ID')} (${exp.category})\n\n`;
        });
        message += `💰 *Total:* Rp ${total.toLocaleString('id-ID')}`;

        return message;
    } catch (error) {
        console.error('Today expenses error:', error);
        return `❌ Gagal mengambil data pengeluaran.`;
    }
}

async function handleWeekExpenses(userId: string): Promise<string> {
    try {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const expenses = await prisma.expense.findMany({
            where: {
                userId,
                date: {
                    gte: weekAgo
                }
            }
        });

        if (expenses.length === 0) {
            return `📊 *Pengeluaran Minggu Ini*\n\nBelum ada pengeluaran minggu ini.`;
        }

        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const categoryTotals = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {} as Record<string, number>);

        let message = `📊 *Pengeluaran 7 Hari Terakhir*\n\n`;
        message += `📝 Total Transaksi: ${expenses.length}\n`;
        message += `💰 Total: Rp ${total.toLocaleString('id-ID')}\n\n`;
        message += `📁 *Per Kategori:*\n`;

        Object.entries(categoryTotals).forEach(([cat, amount]) => {
            message += `• ${cat}: Rp ${amount.toLocaleString('id-ID')}\n`;
        });

        return message;
    } catch (error) {
        console.error('Week expenses error:', error);
        return `❌ Gagal mengambil data pengeluaran.`;
    }
}

async function handleTodaySchedule(userId: string): Promise<string> {
    try {
        const today = new Date();
        const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

        // Get recurring events for today's day
        const recurringEvents = await prisma.event.findMany({
            where: {
                userId,
                isRecurring: true,
                day: dayName
            },
            orderBy: { startTime: 'asc' }
        });

        // Get specific date events for today
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const tomorrowDate = new Date(todayDate);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);

        const dateEvents = await prisma.event.findMany({
            where: {
                userId,
                date: {
                    gte: todayDate,
                    lt: tomorrowDate
                }
            },
            orderBy: { startTime: 'asc' }
        });

        const allEvents = [...recurringEvents, ...dateEvents];

        if (allEvents.length === 0) {
            return `📅 *Jadwal Hari Ini (${dayName})*\n\nTidak ada jadwal hari ini. Santai! 😊`;
        }

        let message = `📅 *Jadwal Hari Ini (${dayName})*\n\n`;
        allEvents.forEach(event => {
            const emoji = event.type === 'class' ? '📚' : event.type === 'exam' ? '📝' : '📌';
            message += `${emoji} *${event.title}*\n`;
            message += `   🕐 ${event.startTime}`;
            if (event.endTime) message += ` - ${event.endTime}`;
            if (event.location) message += `\n   📍 ${event.location}`;
            message += `\n\n`;
        });

        return message;
    } catch (error) {
        console.error('Schedule error:', error);
        return `❌ Gagal mengambil jadwal.`;
    }
}

async function sendWhatsAppReply(phone: string, message: string): Promise<void> {
    try {
        const fonnte_api_key = process.env.FONNTE_API_KEY;

        if (!fonnte_api_key) {
            console.error('FONNTE_API_KEY not configured');
            return;
        }

        await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                'Authorization': fonnte_api_key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                target: phone,
                message: message,
                countryCode: '62'
            })
        });
    } catch (error) {
        console.error('Failed to send WhatsApp reply:', error);
    }
}
