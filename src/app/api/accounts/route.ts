import { NextResponse } from 'next/server';
import { prisma, handleDatabaseError } from '@/lib/db';

// GET all accounts
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || 'default-user';

        const accounts = await prisma.account.findMany({
            where: { userId },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(accounts);
    } catch (error) {
        const dbError = handleDatabaseError(error);
        return NextResponse.json(dbError, { status: 500 });
    }
}

// POST create new account
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, type, balance, color, userId = 'default-user' } = body;

        if (!name || !type) {
            return NextResponse.json(
                { error: 'Name and type are required' },
                { status: 400 }
            );
        }

        const account = await prisma.account.create({
            data: {
                name,
                type,
                balance: parseFloat(balance) || 0,
                color,
                userId,
            },
        });

        return NextResponse.json(account, { status: 201 });
    } catch (error) {
        const dbError = handleDatabaseError(error);
        return NextResponse.json(dbError, { status: 500 });
    }
}
