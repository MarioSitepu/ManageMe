import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { syncEventToGoogle, getUpcomingFromGoogle } from '@/lib/googleCalendar';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Tool definitions for Groq (OpenAI-compatible format)
const tools = [
    {
        type: 'function' as const,
        function: {
            name: 'add_expense',
            description: 'Add a new expense/pengeluaran. Use this when user wants to record spending/purchase.',
            parameters: {
                type: 'object',
                properties: {
                    amount: { type: 'number', description: 'The amount of money spent in Rupiah' },
                    category: {
                        type: 'string',
                        description: 'Category of expense',
                        enum: ['food', 'transport', 'shopping', 'entertainment', 'bills', 'other']
                    },
                    description: { type: 'string', description: 'Description of what was purchased' }
                },
                required: ['amount', 'category', 'description']
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'get_balance',
            description: 'Get account balances. Use when user asks about saldo/balance/uang.',
            parameters: { type: 'object', properties: {} }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'get_today_expenses',
            description: 'Get today\'s expenses. Use when user asks about today\'s spending/pengeluaran hari ini.',
            parameters: { type: 'object', properties: {} }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'get_week_expenses',
            description: 'Get this week\'s expenses summary. Use when user asks about weekly spending.',
            parameters: { type: 'object', properties: {} }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'get_schedule',
            description: 'Get today\'s schedule/jadwal. Use when user asks about schedule/jadwal/kelas.',
            parameters: { type: 'object', properties: {} }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'add_event',
            description: 'Add a new event/schedule/jadwal/kelas. Use when user wants to add a class, meeting, exam, or any event to their schedule.',
            parameters: {
                type: 'object',
                properties: {
                    title: { type: 'string', description: 'Title/name of the event' },
                    type: {
                        type: 'string',
                        description: 'Type of event',
                        enum: ['class', 'assignment', 'meeting', 'personal', 'exam', 'study']
                    },
                    startTime: { type: 'string', description: 'Start time in HH:MM format, e.g. "08:00"' },
                    endTime: { type: 'string', description: 'End time in HH:MM format, e.g. "10:00" (optional)' },
                    day: { type: 'string', description: 'Day of week for recurring events: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday' },
                    location: { type: 'string', description: 'Location of the event (optional)' },
                    isRecurring: { type: 'boolean', description: 'Whether this event repeats weekly. Default true for classes.' }
                },
                required: ['title', 'type', 'startTime']
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'add_note',
            description: 'Add or update a daily note/catatan. Use when user wants to write a note or catatan for today.',
            parameters: {
                type: 'object',
                properties: {
                    content: { type: 'string', description: 'The note content/text to save' }
                },
                required: ['content']
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'get_notes',
            description: 'Get today\'s daily note. Use when user asks about their notes/catatan.',
            parameters: { type: 'object', properties: {} }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'add_todo',
            description: 'Add a new todo/task/tugas. Use when user wants to add something to their to-do list.',
            parameters: {
                type: 'object',
                properties: {
                    text: { type: 'string', description: 'The todo/task description' },
                    dueDate: { type: 'string', description: 'Due date in YYYY-MM-DD format (optional)' }
                },
                required: ['text']
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'list_todos',
            description: 'List all pending todos/tasks. Use when user asks about their todo list/tugas.',
            parameters: { type: 'object', properties: {} }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'complete_todo',
            description: 'Mark a todo as completed. Use when user says they finished/completed a task.',
            parameters: {
                type: 'object',
                properties: {
                    todoNumber: { type: 'number', description: 'The number of the todo item to mark as complete (from the list)' }
                },
                required: ['todoNumber']
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'get_google_calendar',
            description: 'Get upcoming events from Google Calendar. Use when user asks about gcal, google calendar, or upcoming events from their Google account.',
            parameters: { type: 'object', properties: {} }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'show_menu',
            description: 'Show help menu with available commands. Use when user asks for help/menu/bantuan.',
            parameters: { type: 'object', properties: {} }
        }
    }
];

// Fonnte Webhook Handler
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, sender } = body;

        const text = message?.trim() || '';
        const phone = sender || '';

        if (!text || !phone) {
            return NextResponse.json({ success: true, response: 'Skipped: no text or phone' });
        }

        console.log('Received WhatsApp message:', { text, phone });

        // Clean phone number (e.g. 62812... -> 812...)
        const cleanPhone = phone.replace(/\D/g, '');
        const phoneSuffix = cleanPhone.startsWith('62') ? cleanPhone.substring(2)
            : cleanPhone.startsWith('0') ? cleanPhone.substring(1)
                : cleanPhone;

        // Lookup user by phone suffix
        const user = await prisma.user.findFirst({
            where: {
                phoneNumber: {
                    endsWith: phoneSuffix
                }
            }
        });

        if (!user) {
            const unregisteredMsg = `❌ *Nomor Belum Terdaftar*\n\nNomor WhatsApp ini belum terhubung ke akun TrackMe mana pun.\n\nSilakan login ke Web TrackMe (Google Login) lalu masukkan nomor Anda di menu *Profile* agar bot ini bisa mencatat ke akun Anda.`;
            await sendWhatsAppReply(phone, unregisteredMsg);
            return NextResponse.json({ success: true, response: 'Unregistered user' });
        }

        const response = await processMessage(text, user.id);

        if (response) {
            await sendWhatsAppReply(phone, response);
        }

        return NextResponse.json({ success: true, response });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: 'ok', message: 'TrackMe WhatsApp Bot is running' });
}

// ==========================================
// HYBRID: AI + Command Fallback
// ==========================================
async function processMessage(text: string, userId: string): Promise<string> {
    try {
        if (GROQ_API_KEY) {
            const aiResult = await processWithGroq(text, userId);
            if (aiResult) return aiResult;
        }
    } catch (error) {
        console.log('AI unavailable, using command parser fallback:', error);
    }

    return processCommand(text.toLowerCase(), userId);
}

// ==========================================
// COMMAND PARSER (Always works, no API needed)
// ==========================================
async function processCommand(text: string, userId: string): Promise<string> {
    if (['menu', 'help', '/start', 'bantuan'].includes(text)) {
        return getMenuMessage();
    }

    // Expenses
    if (text.startsWith('add ') || text.startsWith('catat ')) {
        const input = text.replace(/^(add|catat)\s+/, '').trim();
        return await parseAndAddExpense(input, userId);
    }
    if (['balance', 'saldo', 'cek saldo', 'sisa uang'].includes(text)) {
        return await handleGetBalance(userId);
    }
    if (['today', 'hari ini', 'pengeluaran hari ini'].includes(text)) {
        return await handleTodayExpenses(userId);
    }
    if (['week', 'minggu', 'minggu ini', 'pengeluaran minggu ini'].includes(text)) {
        return await handleWeekExpenses(userId);
    }

    // Schedule
    if (['schedule', 'jadwal', 'jadwal hari ini', 'kelas'].includes(text)) {
        return await handleTodaySchedule(userId);
    }

    // Google Calendar
    if (['gcal', 'google calendar', 'kalender google'].includes(text)) {
        return await getUpcomingFromGoogle(userId, 7);
    }
    if (['gcal pull', 'pull gcal', 'sync gcal', 'import kalender'].includes(text)) {
        return await handlePullFromGoogle(userId);
    }

    // Notes
    if (text.startsWith('note ') || text.startsWith('catatan ')) {
        const content = text.replace(/^(note|catatan)\s+/, '').trim();
        return await handleAddNote(content, userId);
    }
    if (['notes', 'catatan', 'catatan hari ini'].includes(text)) {
        return await handleGetNotes(userId);
    }

    // Todos
    if (text.startsWith('todo ') || text.startsWith('tugas ')) {
        const taskText = text.replace(/^(todo|tugas)\s+/, '').trim();
        return await handleAddTodo(taskText, undefined, userId);
    }
    if (['todos', 'todo', 'tugas', 'daftar tugas', 'list todo'].includes(text)) {
        return await handleListTodos(userId);
    }
    if (text.startsWith('done ') || text.startsWith('selesai ')) {
        const num = parseInt(text.replace(/^(done|selesai)\s+/, '').trim());
        if (!isNaN(num)) return await handleCompleteTodo(num, userId);
    }

    return `❓ Perintah tidak dikenali.\n\nKetik *menu* untuk melihat daftar perintah.`;
}

async function parseAndAddExpense(input: string, userId: string): Promise<string> {
    const parts = input.split(' ');
    if (parts.length < 3) {
        return `❌ Format: *add [jumlah] [kategori] [deskripsi]*\nContoh: add 50000 food nasi goreng`;
    }

    const amount = parseFloat(parts[0]);
    if (isNaN(amount) || amount <= 0) return `❌ Jumlah tidak valid!`;

    const category = parts[1].toLowerCase();
    const validCategories = ['food', 'transport', 'shopping', 'entertainment', 'bills', 'other'];
    if (!validCategories.includes(category)) {
        return `❌ Kategori tidak valid!\nKategori: ${validCategories.join(', ')}`;
    }

    const description = parts.slice(2).join(' ');
    return await handleAddExpense(amount, category, description, userId);
}

// ==========================================
// GROQ AI PROCESSOR
// ==========================================
async function processWithGroq(text: string, userId: string): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                {
                    role: 'system',
                    content: `You are TrackMe Bot, a WhatsApp assistant for expense tracking, schedule management, notes, and todos.
You understand Indonesian and English. Always use the provided tools/functions.
- Spending/purchase → add_expense. Convert: "50rb"=50000, "100k"=100000, "50 ribu"=50000
- Balance/saldo → get_balance
- Today's expenses → get_today_expenses
- Weekly expenses → get_week_expenses
- Schedule/jadwal → get_schedule
- Add class/meeting/event → add_event (guess day from context, default isRecurring=true for classes)
- Write note/catatan → add_note
- Read notes → get_notes
- Add task/todo/tugas → add_todo
- List tasks → list_todos
- Complete task → complete_todo
- Google Calendar events → get_google_calendar
- Help/menu → show_menu`
                },
                { role: 'user', content: text }
            ],
            tools,
            tool_choice: 'auto',
            temperature: 0.2,
            max_tokens: 500
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    if (!choice) return '';

    const toolCalls = choice.message?.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
        const toolCall = toolCalls[0];
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments || '{}');

        console.log('Groq Function Call:', functionName, args);

        switch (functionName) {
            case 'add_expense':
                return await handleAddExpense(args.amount, args.category, args.description, userId);
            case 'get_balance':
                return await handleGetBalance(userId);
            case 'get_today_expenses':
                return await handleTodayExpenses(userId);
            case 'get_week_expenses':
                return await handleWeekExpenses(userId);
            case 'get_schedule':
                return await handleTodaySchedule(userId);
            case 'add_event':
                return await handleAddEvent(args.title, args.type, args.startTime, args.endTime, args.day, args.location, args.isRecurring, userId);
            case 'add_note':
                return await handleAddNote(args.content, userId);
            case 'get_notes':
                return await handleGetNotes(userId);
            case 'add_todo':
                return await handleAddTodo(args.text, args.dueDate, userId);
            case 'list_todos':
                return await handleListTodos(userId);
            case 'complete_todo':
                return await handleCompleteTodo(args.todoNumber, userId);
            case 'get_google_calendar':
                return await getUpcomingFromGoogle(userId, 7);
            case 'show_menu':
                return getMenuMessage();
            default:
                return '';
        }
    }

    return choice.message?.content || '';
}

// ==========================================
// MENU
// ==========================================
function getMenuMessage(): string {
    return `🤖 *TrackMe Bot*

📝 *Perintah yang Tersedia:*

💰 *Keuangan:*
• "beli nasi goreng 50rb" (natural)
• *add 50000 food nasi goreng*
• *saldo* — cek saldo
• *hari ini* — pengeluaran hari ini
• *minggu ini* — pengeluaran minggu ini

📅 *Jadwal:*
• "tambah kelas Matematika Senin jam 8" (natural)
• *jadwal* — lihat jadwal hari ini

🔗 *Google Calendar (Sinkron 2 Arah):*
• *gcal* — lihat 7 hari ke depan
• *gcal pull* — import event dari Google Calendar
• (Tambah jadwal di app/WA → otomatis sync ke Google Calendar)

📝 *Catatan:*
• *note [isi catatan]* — tulis catatan
• *catatan* — lihat catatan hari ini

✅ *Todo:*
• *todo [tugas]* — tambah tugas
• *todos* — lihat daftar tugas
• *done [nomor]* — selesaikan tugas

❓ *menu* — tampilkan menu ini

💡 Bicara natural saja, AI akan memahami! 🚀`;
}

// ==========================================
// GOOGLE CALENDAR HANDLERS
// ==========================================
async function handlePullFromGoogle(userId: string): Promise<string> {
    try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/google/pull`, { method: 'POST' });
        const data = await res.json();

        if (!res.ok) {
            if (data.hint) return `❌ ${data.error}\n\n💡 ${data.hint}`;
            return `❌ ${data.error || 'Gagal import dari Google Calendar.'}`;
        }

        return `✅ *Import dari Google Calendar Selesai!*\n\n📅 ${data.created} event baru diimport\n⏭️ ${data.skipped} event dilewati (sudah ada)`;
    } catch (error) {
        console.error('Pull from Google error:', error);
        return `❌ Gagal import dari Google Calendar.`;
    }
}

// ==========================================
// EXPENSE HANDLERS
// ==========================================
async function handleAddExpense(amount: number, category: string, description: string, userId: string): Promise<string> {
    try {
        await prisma.expense.create({ data: { amount, category, description, userId } });
        return `✅ *Pengeluaran Dicatat!*\n\n💵 Rp ${amount.toLocaleString('id-ID')}\n📁 ${category}\n📝 ${description}`;
    } catch (error) {
        console.error('Add expense error:', error);
        return `❌ Gagal menambahkan pengeluaran.`;
    }
}

async function handleGetBalance(userId: string): Promise<string> {
    try {
        const accounts = await prisma.account.findMany({ where: { userId }, orderBy: { balance: 'desc' } });
        if (accounts.length === 0) return `📊 *Saldo Akun*\n\nBelum ada akun terdaftar.`;

        const total = accounts.reduce((sum: number, acc: { balance: number }) => sum + acc.balance, 0);
        let msg = `💰 *Saldo Akun*\n\n`;
        accounts.forEach((acc: { name: string; balance: number }) => {
            msg += `${acc.name}: Rp ${acc.balance.toLocaleString('id-ID')}\n`;
        });
        msg += `\n📊 *Total:* Rp ${total.toLocaleString('id-ID')}`;
        return msg;
    } catch (error) {
        console.error('Balance error:', error);
        return `❌ Gagal mengambil saldo.`;
    }
}

async function handleTodayExpenses(userId: string): Promise<string> {
    try {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const expenses = await prisma.expense.findMany({ where: { userId, date: { gte: today } }, orderBy: { date: 'desc' } });
        if (expenses.length === 0) return `📊 *Pengeluaran Hari Ini*\n\nBelum ada pengeluaran. 🎉`;

        const total = expenses.reduce((sum: number, exp: { amount: number }) => sum + exp.amount, 0);
        let msg = `📊 *Pengeluaran Hari Ini*\n\n`;
        expenses.forEach((exp: { description: string; amount: number; category: string }) => {
            msg += `• ${exp.description} — Rp ${exp.amount.toLocaleString('id-ID')} (${exp.category})\n`;
        });
        msg += `\n💰 *Total:* Rp ${total.toLocaleString('id-ID')}`;
        return msg;
    } catch (error) {
        console.error('Today expenses error:', error);
        return `❌ Gagal mengambil pengeluaran.`;
    }
}

async function handleWeekExpenses(userId: string): Promise<string> {
    try {
        const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
        const expenses = await prisma.expense.findMany({ where: { userId, date: { gte: weekAgo } } });
        if (expenses.length === 0) return `📊 *Pengeluaran Minggu Ini*\n\nBelum ada pengeluaran.`;

        const total = expenses.reduce((sum: number, exp: { amount: number }) => sum + exp.amount, 0);
        const cats = expenses.reduce((acc: Record<string, number>, exp: { category: string; amount: number }) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount; return acc;
        }, {} as Record<string, number>);

        let msg = `📊 *Pengeluaran 7 Hari*\n\n📝 ${expenses.length} transaksi\n💰 Total: Rp ${total.toLocaleString('id-ID')}\n\n📁 *Per Kategori:*\n`;
        Object.entries(cats).forEach(([cat, amt]) => { msg += `• ${cat}: Rp ${(amt as number).toLocaleString('id-ID')}\n`; });
        return msg;
    } catch (error) {
        console.error('Week expenses error:', error);
        return `❌ Gagal mengambil pengeluaran.`;
    }
}

// ==========================================
// SCHEDULE/EVENT HANDLERS
// ==========================================
async function handleTodaySchedule(userId: string): Promise<string> {
    try {
        const today = new Date();
        const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

        const recurringEvents = await prisma.event.findMany({
            where: { userId, isRecurring: true, day: dayName },
            orderBy: { startTime: 'asc' }
        });

        const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
        const tomorrowDate = new Date(todayDate); tomorrowDate.setDate(tomorrowDate.getDate() + 1);

        const dateEvents = await prisma.event.findMany({
            where: { userId, date: { gte: todayDate, lt: tomorrowDate } },
            orderBy: { startTime: 'asc' }
        });

        const allEvents = [...recurringEvents, ...dateEvents];
        if (allEvents.length === 0) return `📅 *Jadwal Hari Ini (${dayName})*\n\nTidak ada jadwal. Santai! 😊`;

        let msg = `📅 *Jadwal Hari Ini (${dayName})*\n\n`;
        allEvents.forEach((e: { type: string; title: string; startTime: string; endTime: string | null; location: string | null }) => {
            const emoji = e.type === 'class' ? '📚' : e.type === 'exam' ? '📝' : '📌';
            msg += `${emoji} *${e.title}*\n   🕐 ${e.startTime}`;
            if (e.endTime) msg += ` - ${e.endTime}`;
            if (e.location) msg += `\n   📍 ${e.location}`;
            msg += `\n\n`;
        });
        return msg;
    } catch (error) {
        console.error('Schedule error:', error);
        return `❌ Gagal mengambil jadwal.`;
    }
}

async function handleAddEvent(
    title: string, type: string, startTime: string, endTime?: string,
    day?: string, location?: string, isRecurring?: boolean, userId: string = 'default-user'
): Promise<string> {
    try {
        const recurring = isRecurring ?? (type === 'class');
        const eventDay = day || new Date().toLocaleDateString('en-US', { weekday: 'long' });

        const newEvent = await prisma.event.create({
            data: {
                title, type, startTime,
                endTime: endTime || null,
                day: recurring ? eventDay : null,
                date: recurring ? null : new Date(),
                isRecurring: recurring,
                recurringPattern: recurring ? 'weekly' : null,
                location: location || null,
                userId
            }
        });

        // Auto-sync to Google Calendar (non-blocking)
        syncEventToGoogle(newEvent.id, userId).catch(e =>
            console.log('Google Calendar sync skipped:', e.message)
        );

        let msg = `✅ *Jadwal Ditambahkan!*\n\n`;
        const emoji = type === 'class' ? '📚' : type === 'exam' ? '📝' : '📌';
        msg += `${emoji} *${title}*\n🕐 ${startTime}`;
        if (endTime) msg += ` - ${endTime}`;
        if (recurring) msg += `\n📅 Setiap ${eventDay}`;
        if (location) msg += `\n📍 ${location}`;
        msg += `\n\n🗓️ _Disinkronkan ke Google Calendar jika terhubung_`;
        return msg;
    } catch (error) {
        console.error('Add event error:', error);
        return `❌ Gagal menambahkan jadwal.`;
    }
}

// ==========================================
// DAILY NOTES HANDLERS
// ==========================================
async function handleAddNote(content: string, userId: string): Promise<string> {
    try {
        const today = new Date(); today.setHours(0, 0, 0, 0);

        await prisma.dailyNote.upsert({
            where: { userId_date: { userId, date: today } },
            update: { content },
            create: { content, date: today, userId }
        });

        return `📝 *Catatan Disimpan!*\n\n${content}`;
    } catch (error) {
        console.error('Add note error:', error);
        return `❌ Gagal menyimpan catatan.`;
    }
}

async function handleGetNotes(userId: string): Promise<string> {
    try {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

        const note = await prisma.dailyNote.findFirst({
            where: { userId, date: { gte: today, lt: tomorrow } }
        });

        if (!note) return `📝 *Catatan Hari Ini*\n\nBelum ada catatan untuk hari ini.\nKetik *note [isi]* untuk menulis.`;
        return `📝 *Catatan Hari Ini*\n\n${note.content}`;
    } catch (error) {
        console.error('Get notes error:', error);
        return `❌ Gagal mengambil catatan.`;
    }
}

// ==========================================
// TODO HANDLERS
// ==========================================
async function handleAddTodo(text: string, dueDate?: string, userId: string = 'default-user'): Promise<string> {
    try {
        await prisma.todo.create({
            data: {
                text,
                dueDate: dueDate ? new Date(dueDate) : null,
                userId
            }
        });

        let msg = `✅ *Tugas Ditambahkan!*\n\n📌 ${text}`;
        if (dueDate) msg += `\n📅 Deadline: ${dueDate}`;
        return msg;
    } catch (error) {
        console.error('Add todo error:', error);
        return `❌ Gagal menambahkan tugas.`;
    }
}

async function handleListTodos(userId: string): Promise<string> {
    try {
        const todos = await prisma.todo.findMany({
            where: { userId, completed: false },
            orderBy: { createdAt: 'asc' }
        });

        if (todos.length === 0) return `✅ *Daftar Tugas*\n\nSemua tugas sudah selesai! 🎉\nKetik *todo [tugas]* untuk menambah.`;

        let msg = `✅ *Daftar Tugas* (${todos.length})\n\n`;
        todos.forEach((t: { text: string; dueDate: Date | null }, i: number) => {
            msg += `${i + 1}. ${t.text}`;
            if (t.dueDate) msg += ` 📅 ${t.dueDate.toLocaleDateString('id-ID')}`;
            msg += `\n`;
        });
        msg += `\nKetik *done [nomor]* untuk menyelesaikan.`;
        return msg;
    } catch (error) {
        console.error('List todos error:', error);
        return `❌ Gagal mengambil daftar tugas.`;
    }
}

async function handleCompleteTodo(todoNumber: number, userId: string): Promise<string> {
    try {
        const todos = await prisma.todo.findMany({
            where: { userId, completed: false },
            orderBy: { createdAt: 'asc' }
        });

        if (todoNumber < 1 || todoNumber > todos.length) {
            return `❌ Nomor tugas tidak valid! Ketik *todos* untuk lihat daftar.`;
        }

        const todo = todos[todoNumber - 1];
        await prisma.todo.update({
            where: { id: todo.id },
            data: { completed: true, completedAt: new Date() }
        });

        return `🎉 *Tugas Selesai!*\n\n✅ ~~${todo.text}~~\n\nKetik *todos* untuk lihat sisa tugas.`;
    } catch (error) {
        console.error('Complete todo error:', error);
        return `❌ Gagal menyelesaikan tugas.`;
    }
}

// ==========================================
// WHATSAPP REPLY
// ==========================================
async function sendWhatsAppReply(phone: string, message: string): Promise<void> {
    try {
        const fonnte_api_key = process.env.FONNTE_API_KEY;
        if (!fonnte_api_key) { console.error('FONNTE_API_KEY not configured'); return; }

        await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: { 'Authorization': fonnte_api_key, 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: phone, message, countryCode: '62' })
        });
    } catch (error) {
        console.error('Failed to send WhatsApp reply:', error);
    }
}
